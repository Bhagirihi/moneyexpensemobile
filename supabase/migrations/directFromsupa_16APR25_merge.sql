-- DROP TABLES (in dependency-safe order)
DROP TABLE IF EXISTS shared_users CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS expense_boards CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- TABLE DEFINITIONS

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY,
  user_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  trip_name text,
  read boolean,
  icon text,
  icon_color text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  full_name text,
  email_address text,
  mobile text,
  avatar_url text,
  has_notifications boolean,
  current_plan text,
  is_google_connected boolean,
  account_status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  total_boards integer,
  default_board_budget numeric,
  board_id uuid,
  referral_code text
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  color text,
  is_default boolean,
  user_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS expense_boards (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  total_budget numeric,
  created_by uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  board_color text,
  board_icon text,
  per_person_budget numeric,
  share_code text,
  is_default boolean
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY,
  board_id uuid,
  category_id uuid,
  amount numeric NOT NULL,
  description text,
  date timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  payment_method text
);

CREATE TABLE public.shared_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  is_accepted BOOLEAN DEFAULT false,
  shared_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shared_with TEXT NOT NULL,
  board_id UUID NOT NULL REFERENCES expense_boards(id) ON DELETE CASCADE
);


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


-- FOREIGN KEY CONSTRAINTS

ALTER TABLE profiles ADD CONSTRAINT fk_profiles_board_id FOREIGN KEY (board_id) REFERENCES expense_boards (id);
ALTER TABLE categories ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles (id);
ALTER TABLE expense_boards ADD CONSTRAINT expense_boards_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles (id);
ALTER TABLE expenses ADD CONSTRAINT expenses_board_id_fkey FOREIGN KEY (board_id) REFERENCES expense_boards (id);
ALTER TABLE expenses ADD CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories (id);
ALTER TABLE expenses ADD CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles (id);
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles (id);
ALTER TABLE shared_users ADD CONSTRAINT shared_users_board_id_fkey FOREIGN KEY (board_id) REFERENCES expense_boards (id);
ALTER TABLE shared_users ADD CONSTRAINT shared_users_shared_by_fkey FOREIGN KEY (shared_by) REFERENCES profiles (id);

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

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
DECLARE
    default_board_id UUID;
BEGIN
    -- Insert into profiles table
    INSERT INTO public.profiles (
        id,
        full_name,
        email_address,
        mobile,
        avatar_url,
        has_notifications,
        current_plan,
        is_google_connected,
        account_status
    )
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.email,
        NEW.raw_user_meta_data->>'mobile',
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE((NEW.raw_user_meta_data->>'has_notifications')::boolean, false),
        'free',
        COALESCE((NEW.raw_user_meta_data->>'is_google_connected')::boolean, false),
        'active'
    );

    -- Create default categories for the new user
    INSERT INTO public.categories (
        name,
        description,
        icon,
        color,
        user_id,
        is_default
    )
    VALUES
        ('Food', 'Food and dining expenses', 'food', '#FF6B6B', NEW.id, true),
        ('Transport', 'Transportation costs', 'car', '#4ECDC4', NEW.id, true),
        ('Shopping', 'Shopping and retail', 'shopping', '#45B7D1', NEW.id, true),
        ('Entertainment', 'Entertainment and leisure', 'movie', '#96CEB4', NEW.id, true),
        ('Health', 'Health and medical expenses', 'heart', '#FFEEAD', NEW.id, true),
        ('Education', 'Education and learning', 'book', '#D4A5A5', NEW.id, true),
        ('Housing', 'Housing and utilities', 'home', '#9B59B6', NEW.id, true),
        ('Travel', 'Travel and tourism', 'airplane', '#3498DB', NEW.id, true);

    -- Create a default ""General Expense"" board
    INSERT INTO public.expense_boards (
        name,
        description,
        total_budget,
        created_by
    )
    VALUES (
        'General Expenses',
        'Default board for tracking general expenses',
        NULL,  -- No specific budget limit
        NEW.id
    )
    RETURNING id INTO default_board_id;

    -- Log the successful creation
    RAISE NOTICE 'Created default data for user %: Profile, Categories, and General Expense Board (ID: %)',
        NEW.id,
        default_board_id;

    RETURN NEW;
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
  UPDATE profiles
  SET default_board_budget = NEW.total_budget
  WHERE board_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.sync_budget_on_board_id_change() RETURNS trigger AS $$
BEGIN
  UPDATE profiles
  SET default_board_budget = (
    SELECT total_budget FROM expense_boards WHERE id = NEW.board_id
  )
  WHERE id = NEW.id; -- Replace with user_id = NEW.user_id if needed

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
