-- DROP TABLES (in dependency-safe order)
DROP TABLE IF EXISTS shared_users CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS expense_boards CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- TABLE DEFINITIONS

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  trip_name text,
  read boolean,
  icon text,
  icon_color text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email_address text,
  mobile text,
  avatar_url text,
  has_notifications boolean,
  is2fa boolean,
  current_plan text,
  is_google_connected boolean,
  account_status text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  total_boards integer,
  default_board_budget numeric,
  board_id uuid,
  referral_code text
  expo_push_token character varying(255) null,
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  color text,
  is_default boolean,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expense_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique identifier for each board
  name text NOT NULL, -- Board title (e.g., Goa Trip)
  description text, -- Optional description
  total_budget numeric DEFAULT 0, -- Total budget for the board
  total_expense numeric DEFAULT 0, -- Calculated sum of all expenses
  created_by uuid REFERENCES profiles(id), -- Creator of the board
  created_at timestamp with time zone DEFAULT now(), -- Created timestamp
  updated_at timestamp with time zone DEFAULT now(), -- Last updated timestamp
  board_color text, -- Optional color for UI
  board_icon text, -- Optional icon for UI
  per_person_budget numeric DEFAULT 0, -- Optional: divided budget among members
  share_code text, -- Used for invite/share functionality
  is_default boolean DEFAULT false -- True if this is user's default board
);


CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique ID for each expense
  board_id uuid REFERENCES expense_boards(id) ON DELETE CASCADE, -- Link to the board
  category_id uuid REFERENCES categories(id), -- Optional category (assumes categories table exists)
  amount numeric NOT NULL, -- Expense amount
  description text, -- Description of expense
  date timestamp with time zone DEFAULT now(), -- Date of expense
  created_by uuid REFERENCES profiles(id), -- Who added the expense
  created_at timestamp with time zone DEFAULT now(), -- When expense was added
  updated_at timestamp with time zone DEFAULT now(), -- Last updated time
  payment_method text -- Optional: cash, card, UPI, etc.
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shared_status') THEN
        CREATE TYPE shared_status AS ENUM ('accepted', 'pending', 'rejected');
    END IF;
END$$;
-- Step 2: Create the table
CREATE TABLE IF NOT EXISTS shared_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique entry ID for sharing
    created_at TIMESTAMPTZ DEFAULT now(), -- Share timestamp
    is_accepted BOOLEAN DEFAULT false, -- Whether invite was accepted
    accepted_at TIMESTAMPTZ, -- When invite was accepted (optional)
    shared_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Who sent the invite
    shared_with TEXT NOT NULL, -- Email or identifier of invited user
    board_id uuid NOT NULL REFERENCES expense_boards(id) ON DELETE CASCADE, -- Board being shared
    user_id uuid REFERENCES profiles(id), -- Once accepted, link to actual user (optional)
    total_expense numeric DEFAULT 0, -- Optional: personal expenses on this board
    total_spent numeric DEFAULT 0, -- Optional: personal spend summary
    status shared_status NOT NULL DEFAULT 'pending' -- Invite status
);



-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON "public"."profiles"("email_address");
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON "public"."profiles"("referral_code");
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON "public"."categories"("user_id");
CREATE INDEX IF NOT EXISTS idx_expense_boards_created_by ON "public"."expense_boards"("created_by");
CREATE INDEX IF NOT EXISTS idx_expenses_board_id ON "public"."expenses"("board_id");
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON "public"."expenses"("category_id");
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON "public"."notifications"("user_id");

-- Add RLS (Row Level Security) policies
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."expense_boards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shared_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;





DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, schemaname, tablename
    FROM pg_policies
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname, r.schemaname, r.tablename
    );
  END LOOP;
END $$;

-- Example: allow read if profile.id matches any shared_users.user_id the logged-in user has access to
CREATE POLICY "Allow read if related via shared_users"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shared_users
      WHERE shared_users.user_id = profiles.id
      AND (
        shared_users.shared_by = auth.uid()
        OR shared_users.user_id = auth.uid()
      )
    )
  );

-- Create policies
CREATE POLICY "Users can view their own profile"
    ON "public"."profiles"
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON "public"."profiles"
    FOR UPDATE
    USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can view their own categories"
    ON "public"."categories"
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow owners to manage their boards"
  ON expense_boards
  FOR ALL
  USING (
    auth.uid() = created_by
  )
  WITH CHECK (
    auth.uid() = created_by
  );

CREATE POLICY "Users can insert their own categories"
    ON "public"."categories"
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
    ON "public"."categories"
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
    ON "public"."categories"
    FOR DELETE
    USING (auth.uid() = user_id);

-- Expense boards policies
CREATE POLICY "Users can view their own expense boards"
    ON "public"."expense_boards"
    FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own expense boards"
    ON "public"."expense_boards"
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own expense boards"
    ON "public"."expense_boards"
    FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own expense boards"
    ON "public"."expense_boards"
    FOR DELETE
    USING (auth.uid() = created_by);

-- Allow read access if user is part of a shared board
CREATE POLICY "Allow users to read expenses from shared boards"
ON expenses
FOR SELECT
USING (
  created_by = auth.uid() OR
  board_id IN (
    SELECT board_id FROM shared_users WHERE user_id = auth.uid() AND is_accepted = true
  )
);

-- Expenses policies
CREATE POLICY "Users can view their own expenses"
    ON "public"."expenses"
    FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own expenses"
    ON "public"."expenses"
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own expenses"
    ON "public"."expenses"
    FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own expenses"
    ON "public"."expenses"
    FOR DELETE
    USING (auth.uid() = created_by);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON "public"."notifications"
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
    ON "public"."notifications"
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON "public"."notifications"
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON "public"."notifications"
    FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Can read shared items"
  ON public.shared_users
  FOR SELECT
  USING (shared_by = auth.uid());

CREATE POLICY "Allow uploads for authenticated users"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow read for authenticated users"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow delete for authenticated users"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policy for debugging (make sure to restrict later!)
CREATE POLICY "Allow read for authenticated users"
ON shared_users
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to view boards shared with them
CREATE POLICY "Allow access to shared boards"
  ON expense_boards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shared_users
      WHERE shared_users.board_id = expense_boards.id
      AND shared_users.user_id = auth.uid()
      AND shared_users.is_accepted = true
    )
    OR created_by = auth.uid() -- Optional: also allow board owners
  );

  CREATE POLICY "Allow read access to all profiles for testing"
  ON profiles
  FOR SELECT
  USING (true);

  create policy "Allow access to board owner or accepted shared user"
on expenses
for select
using (
  -- Step 1: Allow if user created the board (board's created_by == current_user)
  (
    exists (
      select 1
      from expense_boards
      where
        expense_boards.id = expenses.board_id
        and expense_boards.created_by = auth.uid()
    )
  )
  -- Step 2: OR allow if user is in shared_users table (accepted)
  OR
  (
    exists (
      select 1
      from shared_users
      where
        shared_users.board_id = expenses.board_id
        and shared_users.user_id = auth.uid()
        and shared_users.is_accepted = true
    )
  )
);



-- FOREIGN KEY CONSTRAINTS

-- Drop constraints on profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS fk_profiles_board_id;

-- Drop constraints on categories table
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;

-- Drop constraints on expense_boards table
ALTER TABLE expense_boards DROP CONSTRAINT IF EXISTS expense_boards_created_by_fkey;

-- Drop constraints on expenses table
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_board_id_fkey;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_created_by_fkey;

ALTER TABLE shared_users DROP CONSTRAINT shared_users_shared_by_fkey;

-- Drop constraints on notifications table
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Drop constraints on shared_users table
ALTER TABLE shared_users DROP CONSTRAINT IF EXISTS shared_users_user_id_fkey;


ALTER TABLE profiles ADD CONSTRAINT fk_profiles_board_id
FOREIGN KEY (board_id) REFERENCES expense_boards (id)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE categories ADD CONSTRAINT categories_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles (id)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE expense_boards ADD CONSTRAINT expense_boards_created_by_fkey
FOREIGN KEY (created_by) REFERENCES profiles (id)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE expenses ADD CONSTRAINT expenses_board_id_fkey
FOREIGN KEY (board_id) REFERENCES expense_boards (id)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE expenses ADD CONSTRAINT expenses_category_id_fkey
FOREIGN KEY (category_id) REFERENCES categories (id)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE expenses ADD CONSTRAINT expenses_created_by_fkey
FOREIGN KEY (created_by) REFERENCES profiles (id)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles (id)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE shared_users ADD CONSTRAINT shared_users_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id)
DEFERRABLE INITIALLY DEFERRED;

-- Link shared_by to profiles.id
ALTER TABLE shared_users ADD CONSTRAINT shared_users_shared_by_fkey
FOREIGN KEY (shared_by) REFERENCES profiles(id);
DEFERRABLE INITIALLY DEFERRED;

-- Link user_id to profiles.id
ALTER TABLE shared_users ADD CONSTRAINT shared_users_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id);
DEFERRABLE INITIALLY DEFERRED;


-- FUNCTION DEFINITIONS

CREATE OR REPLACE FUNCTION public.update_default_board_budget() RETURNS trigger AS $$
BEGIN
  UPDATE board_settings
  SET default_board_budget = NEW.total_budget
  WHERE board_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.mark_notification_as_read(notification_id uuid) RETURNS void AS $$
BEGIN
    UPDATE notifications
    SET read = true
    WHERE id = notification_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read(user_id uuid) RETURNS void AS $$
BEGIN
    UPDATE notifications
    SET read = true
    WHERE notifications.user_id = user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_unread_notifications_count(user_id uuid) RETURNS integer AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO unread_count
    FROM notifications
    WHERE notifications.user_id = user_id
    AND read = false;

    RETURN unread_count;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
    default_board_id UUID;
    referral_code TEXT;
    share_code TEXT;
BEGIN
    -- Start transaction block
    BEGIN
        -- Generate referral code
        SELECT
            string_agg(
                substr(
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                    (random() * 62)::integer + 1,
                    1
                ),
                ''
            )
        INTO referral_code
        FROM generate_series(1, 6);

        -- Generate share code
        SELECT
            string_agg(
                substr(
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                    (random() * 62)::integer + 1,
                    1
                ),
                ''
            )
        INTO share_code
        FROM generate_series(1, 6);

        -- Generate a new UUID for the board
        default_board_id := gen_random_uuid();

        -- Create a default "General Expense" board first
        INSERT INTO public.expense_boards (
            id,
            name,
            description,
            total_budget,
            created_by,
            share_code,
            is_default,
            created_at,
            updated_at
        )
        VALUES (
            default_board_id,
            'General Expenses',
            'Default board for tracking general expenses',
            0,
            NEW.id,
            share_code,
            TRUE,
            NOW(),
            NOW()
        );

        -- Then create the profile with the board_id
        INSERT INTO public.profiles (
            id,
            full_name,
            email_address,
            mobile,
            avatar_url,
            has_notifications,
            is2fa,
            current_plan,
            is_google_connected,
            account_status,
            total_boards,
            board_id,
            referral_code,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data->>'full_name',
            NEW.email,
            NEW.raw_user_meta_data->>'mobile',
            NEW.raw_user_meta_data->>'avatar_url',
            COALESCE((NEW.raw_user_meta_data->>'has_notifications')::boolean, false),
            false,
            'free',
            COALESCE((NEW.raw_user_meta_data->>'is_google_connected')::boolean, false),
            'active',
            1, -- Start with 1 board since we just created it
            default_board_id,
            referral_code,
            NOW(),
            NOW()
        );

        -- Create default categories for the new user
        INSERT INTO public.categories (
            id,
            name,
            description,
            icon,
            color,
            user_id,
            is_default,
            created_at,
            updated_at
        )
        VALUES
            (gen_random_uuid(), 'Food', 'Food and dining expenses', 'food', '#FF6B6B', NEW.id, true, NOW(), NOW()),
            (gen_random_uuid(), 'Transport', 'Transportation costs', 'car', '#4ECDC4', NEW.id, true, NOW(), NOW()),
            (gen_random_uuid(), 'Shopping', 'Shopping and retail', 'shopping', '#45B7D1', NEW.id, true, NOW(), NOW()),
            (gen_random_uuid(), 'Entertainment', 'Entertainment and leisure', 'movie', '#96CEB4', NEW.id, true, NOW(), NOW()),
            (gen_random_uuid(), 'Health', 'Health and medical expenses', 'heart', '#FFEEAD', NEW.id, true, NOW(), NOW()),
            (gen_random_uuid(), 'Education', 'Education and learning', 'book', '#D4A5A5', NEW.id, true, NOW(), NOW()),
            (gen_random_uuid(), 'Housing', 'Housing and utilities', 'home', '#9B59B6', NEW.id, true, NOW(), NOW()),
            (gen_random_uuid(), 'Travel', 'Travel and tourism', 'airplane', '#3498DB', NEW.id, true, NOW(), NOW());

        -- Log the successful creation
        RAISE NOTICE 'Created default data for user %: Profile, Categories, and General Expense Board (ID: %)',
            NEW.id,
            default_board_id;

        RETURN NEW;
    EXCEPTION
        WHEN OTHERS THEN
            -- Log the error
            RAISE EXCEPTION 'Error in handle_new_user: %', SQLERRM;
            -- The transaction will be rolled back automatically
            RETURN NULL;
    END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  select
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS $$
  select
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION auth.email() RETURNS text AS $$
  select
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION public.update_profiles_budget() RETURNS trigger AS $$
BEGIN
-- Only proceed if total_budget has changed (or any other condition you want)
  IF OLD.total_budget IS DISTINCT FROM NEW.total_budget THEN
    UPDATE profiles
    SET default_board_budget = NEW.total_budget
    WHERE board_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.sync_budget_on_board_id_change() RETURNS trigger AS $$
BEGIN
-- Only proceed if the board_id has actually changed
  IF OLD.board_id IS DISTINCT FROM NEW.board_id THEN
  -- Update the profile budget only if necessary
  UPDATE profiles
  SET default_board_budget = (
    SELECT total_budget FROM expense_boards WHERE id = NEW.board_id
  )
  WHERE id = NEW.id; -- Replace with user_id = NEW.user_id if needed
END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.export_full_schema() RETURNS text AS $$
DECLARE
  result text := '';
BEGIN
  -- 1. Export Table Definitions (basic version)
  SELECT string_agg(format(
    'CREATE TABLE IF NOT EXISTS %I (%s);',
    table_name,
    (
      SELECT string_agg(format('%I %s%s',
        column_name,
        data_type,
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END
      ), ', ')
      FROM information_schema.columns
      WHERE table_name = t.table_name
        AND table_schema = 'public'
    )
  ), E'\n\n')
  INTO result
  FROM information_schema.tables t
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

  -- 2. Append Foreign Key Constraints
  result := result || E'\n\n-- Foreign Keys\n';

  SELECT result || E'\n' || string_agg(format(
    'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I (%I);',
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name,
    ccu.column_name
  ), E'\n')
  INTO result
  FROM
    information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';

  -- 3. Append Triggers (public + auth)
  result := result || E'\n\n-- Triggers (public, auth)\n';

  SELECT result || E'\n' || string_agg(format(
    '-- Trigger: %I on %I\nCREATE TRIGGER %I %s %s ON %I FOR EACH ROW %s;',
    trigger_name,
    event_object_table,
    trigger_name,
    action_timing,
    event_manipulation, -- FIXED HERE
    event_object_table,
    action_statement
  ), E'\n\n')
  INTO result
  FROM information_schema.triggers
  WHERE trigger_schema IN ('public', 'auth');

  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb AS $$
  select
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION update_board_total_expense()
RETURNS TRIGGER AS $$
BEGIN
  -- Subtract old amount if it's an update
  IF TG_OP = 'UPDATE' THEN
    UPDATE expense_boards
    SET total_expense = total_expense - OLD.amount + NEW.amount
    WHERE id = NEW.board_id;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE expense_boards
    SET total_expense = total_expense + NEW.amount
    WHERE id = NEW.board_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE expense_boards
    SET total_expense = total_expense - OLD.amount
    WHERE id = OLD.board_id;
  END IF;

  RETURN NULL; -- AFTER trigger must return NULL
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_total_expense()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the total_expense field in the expense_boards table
  UPDATE expense_boards
  SET total_expense = (
    SELECT COALESCE(SUM(e.amount), 0) -- Replace `amount` with the correct field in your `expenses` table
    FROM expenses e
    WHERE e.board_id = NEW.board_id AND e.created_by = NEW.created_by
  )
  WHERE id = NEW.board_id;

  -- Update the shared_users table to reflect the total_expense change
  UPDATE shared_users
  SET total_expense = (
    SELECT COALESCE(SUM(e.amount), 0) -- Replace `amount` with the correct field in your `expenses` table
    FROM expenses e
    WHERE e.board_id = NEW.board_id
  )
  WHERE board_id = NEW.board_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- CREATE OR REPLACE FUNCTION set_shared_user_id()
-- RETURNS trigger AS $$
-- BEGIN
--   IF NEW.user_id IS NULL THEN
--     SELECT id INTO NEW.user_id
--     FROM profiles
--     WHERE email_address = NEW.shared_with
--     LIMIT 1;
--   END IF;

--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;



-- TRIGGERS

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS trg_update_profiles_budget ON expense_boards;
-- Trigger: trg_update_profiles_budget on expense_boards
CREATE TRIGGER trg_update_profiles_budget
AFTER UPDATE ON expense_boards
FOR EACH ROW
EXECUTE FUNCTION update_profiles_budget();

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Trigger: on_auth_user_created on users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS trg_sync_budget_on_board_change ON profiles;
-- Trigger: trg_sync_budget_on_board_change on profiles
CREATE TRIGGER trg_sync_budget_on_board_change
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_budget_on_board_id_change();

DROP TRIGGER IF EXISTS trg_expense_insert ON expenses;
DROP TRIGGER IF EXISTS trg_expense_update ON expenses;
DROP TRIGGER IF EXISTS trg_expense_delete ON expenses;

-- After Insert
CREATE TRIGGER trg_expense_insert
AFTER INSERT ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_board_total_expense();

-- After Update
CREATE TRIGGER trg_expense_update
AFTER UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_board_total_expense();

-- After Delete
CREATE TRIGGER trg_expense_delete
AFTER DELETE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_board_total_expense();

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS trg_update_total_expense_on_insert ON expenses;
-- Trigger to update total_expense after an insert
CREATE TRIGGER trg_update_total_expense_on_insert
AFTER INSERT ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_total_expense();

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS trg_update_total_expense_on_update ON expenses;
-- Trigger to update total_expense after an update
CREATE TRIGGER trg_update_total_expense_on_update
AFTER UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_total_expense();

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS trg_update_total_expense_on_delete ON expenses;
-- Trigger to update total_expense after a delete
CREATE TRIGGER trg_update_total_expense_on_delete
AFTER DELETE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_total_expense();

-- Drop the trigger if it already exists
-- DROP TRIGGER IF EXISTS trg_set_shared_user_id ON shared_users;
-- -- Trigger to set user_id for shared_users
-- CREATE TRIGGER trg_set_shared_user_id
-- BEFORE INSERT ON shared_users
-- FOR EACH ROW
-- EXECUTE FUNCTION set_shared_user_id();
