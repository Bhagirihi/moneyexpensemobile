-- Function: update_default_board_budget
CREATE OR REPLACE FUNCTION public.update_default_board_budget()
RETURNS trigger AS
$$
BEGIN
  UPDATE board_settings
  SET default_board_budget = NEW.total_budget
  WHERE board_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS
$$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: mark_notification_as_read
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(notification_id uuid)
RETURNS void AS
$$
BEGIN
    UPDATE notifications
    SET read = true
    WHERE id = notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function: mark_all_notifications_as_read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read(user_id uuid)
RETURNS void AS
$$
BEGIN
    UPDATE notifications
    SET read = true
    WHERE notifications.user_id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function: get_unread_notifications_count
CREATE OR REPLACE FUNCTION public.get_unread_notifications_count(user_id uuid)
RETURNS integer AS
$$
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

-- Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS
$$
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

    -- Create a default "General Expense" board
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

-- Function: auth.uid
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid AS
$$
SELECT
  COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid;
$$ LANGUAGE sql;

-- Function: auth.role
CREATE OR REPLACE FUNCTION auth.role()
RETURNS text AS
$$
SELECT
  COALESCE(
    NULLIF(current_setting('request.jwt.claim.role', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text;
$$ LANGUAGE sql;

-- Function: auth.email
CREATE OR REPLACE FUNCTION auth.email()
RETURNS text AS
$$
SELECT
  COALESCE(
    NULLIF(current_setting('request.jwt.claim.email', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text;
$$ LANGUAGE sql;

-- Function: update_profiles_budget
CREATE OR REPLACE FUNCTION public.update_profiles_budget()
RETURNS trigger AS
$$
BEGIN
  UPDATE profiles
  SET default_board_budget = NEW.total_budget
  WHERE board_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: sync_budget_on_board_id_change
CREATE OR REPLACE FUNCTION public.sync_budget_on_board_id_change()
RETURNS trigger AS
$$
BEGIN
  UPDATE profiles
  SET default_board_budget = (
    SELECT total_budget FROM expense_boards WHERE id = NEW.board_id
  )
  WHERE id = NEW.id; -- Replace with user_id = NEW.user_id if needed

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: export_full_schema
CREATE OR REPLACE FUNCTION public.export_full_schema()
RETURNS text AS
$$
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

-- Function: auth.jwt
CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb AS
$$
SELECT
  COALESCE(
      NULLIF(current_setting('request.jwt.claim', true), ''),
      NULLIF(current_setting('request.jwt.claims', true), '')
  )::jsonb;
$$ LANGUAGE sql;
