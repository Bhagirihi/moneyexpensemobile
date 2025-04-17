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

CREATE TABLE IF NOT EXISTS shared_users (
  id bigint PRIMARY KEY,
  created_at timestamp with time zone NOT NULL,
  is_accepted boolean,
  shared_by uuid,
  shared_with text,
  board_id uuid
);

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

-- TRIGGERS

-- Trigger: trg_update_profiles_budget on expense_boards
CREATE TRIGGER trg_update_profiles_budget
AFTER UPDATE ON expense_boards
FOR EACH ROW
EXECUTE FUNCTION update_profiles_budget();

-- Trigger: on_auth_user_created on users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Trigger: trg_sync_budget_on_board_change on profiles
CREATE TRIGGER trg_sync_budget_on_board_change
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_budget_on_board_id_change();
