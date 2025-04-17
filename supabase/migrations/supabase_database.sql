-- DELETE ALL DATA FROM ALL TABLES
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (no foreign key dependencies)
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "full_name" TEXT,
    "email_address" TEXT UNIQUE,
    "mobile" TEXT,
    "avatar_url" TEXT,
    "has_notifications" BOOLEAN DEFAULT false,
    "current_plan" TEXT DEFAULT 'free',
    "is_google_connected" BOOLEAN DEFAULT false,
    "account_status" TEXT DEFAULT 'active',
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    "total_boards" INTEGER DEFAULT 0,
    "default_board_budget" DECIMAL(10,2) DEFAULT 0.00,
    "board_id" UUID,
    "referral_code" TEXT UNIQUE
);

-- Create expense_boards table (depends on profiles)
CREATE TABLE IF NOT EXISTS "public"."expense_boards" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "total_budget" DECIMAL(10,2) DEFAULT 0.00,
    "created_by" UUID REFERENCES "public"."profiles"("id"),
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    "board_color" TEXT,
    "board_icon" TEXT,
    "per_person_budget" DECIMAL(10,2),
    "share_code" TEXT UNIQUE,
    "is_default" BOOLEAN DEFAULT false
);

-- Add foreign key to profiles after expense_boards exists
ALTER TABLE "public"."profiles"
ADD CONSTRAINT fk_profiles_board_id
FOREIGN KEY ("board_id")
REFERENCES "public"."expense_boards"("id");

-- Create categories table (depends on profiles)
CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "is_default" BOOLEAN DEFAULT false,
    "user_id" UUID REFERENCES "public"."profiles"("id"),
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create expenses table (depends on expense_boards, categories, and profiles)
CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "board_id" UUID REFERENCES "public"."expense_boards"("id"),
    "category_id" UUID REFERENCES "public"."categories"("id"),
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMPTZ DEFAULT NOW(),
    "created_by" UUID REFERENCES "public"."profiles"("id"),
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    "payment_method" TEXT
);

-- Create notifications table (depends on profiles)
CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "public"."profiles"("id"),
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "trip_name" TEXT,
    "read" BOOLEAN DEFAULT false,
    "icon" TEXT,
    "icon_color" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Insert profiles data (without board_id initially)
INSERT INTO "public"."profiles" (
    "id", "full_name", "email_address", "mobile", "avatar_url", "has_notifications",
    "current_plan", "is_google_connected", "account_status", "created_at", "updated_at",
    "total_boards", "default_board_budget", "referral_code"
) VALUES (
    '4841b1d3-60d8-4386-9718-e56c5dc44fd8', 'Dhruv', 'dhruv@yopmail.com', '7874766500',
    null, false, 'free', false, 'active',
    '2025-03-23 04:21:40.855711+00', '2025-03-23 04:21:40.855711+00',
    3, 0.00, '1234567890'
);

-- Insert categories data
INSERT INTO "public"."categories" ("id", "name", "description", "icon", "color", "is_default", "user_id", "created_at", "updated_at") VALUES
-- Default categories
('09264e2c-6a00-47dc-a257-dacd2a60703a', 'Education', 'Education and learning', 'book', '#D4A5A5', true, null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
('618d34a3-597d-41c4-96b8-336240d04074', 'Food', 'Food and dining expenses', 'food', '#FF6B6B', true, null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
('0d70e61f-a64a-4a34-8122-10ab43ee764d', 'Entertainment', 'Entertainment and leisure', 'movie', '#96CEB4', true, null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
('66ff6918-a497-4c0b-8f0e-f57652be7322', 'Travel', 'Travel and tourism', 'airplane', '#3498DB', true, null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
('bf9b9b02-d77c-45ed-b524-d9184b0327b6', 'Transport', 'Transportation costs', 'car', '#4ECDC4', true, null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
('cf12df90-f7c2-4407-a3f4-951e87443990', 'Shopping', 'Shopping and retail', 'shopping', '#45B7D1', true, null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
('7622a19a-53a7-406d-b223-eb581adab67f', 'Health', 'Health and medical expenses', 'heart', '#FFEEAD', true, null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
('ebe9fe8e-cd00-4ad7-9377-c37a2018c56b', 'Housing', 'Housing and utilities', 'home', '#9B59B6', true, null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
-- User-specific categories (with new unique IDs)

-- Custom categories
('e558e68b-10f7-4a91-8442-9c2931024916', 'New', '', 'heart', '#4ECDC4', false, '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-28 03:43:44.456019+00', '2025-03-28 03:43:44.456019+00'),
('08b2ee79-1278-48ea-9d1d-5975c5ba4f89', 'Travelq', 'Travel and tourism', 'airplane', '#3498DB', false, '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-28 03:44:18.527115+00', '2025-03-28 03:44:18.527115+00');

-- Insert expense boards data
INSERT INTO "public"."expense_boards" (
    "id", "name", "description", "total_budget", "created_by", "created_at",
    "updated_at", "board_color", "board_icon", "per_person_budget", "share_code", "is_default"
) VALUES
('25b2cd3b-9883-4a20-9606-0d81ace5389d', 'General Expenses', 'Default board for tracking general expenses',
0.00, '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-23 04:21:40.855711+00',
'2025-03-23 04:21:40.855711+00', null, null, null, null, true),
('511af495-874d-497a-b136-7c4e1885dbf7', 'Dummy', 'hchc', 10.00, '4841b1d3-60d8-4386-9718-e56c5dc44fd8',
'2025-03-28 08:02:19.442+00', '2025-03-28 08:02:19.475733+00', '#FF6B6B', 'home', null, '8B22LY', false),
('b7adaf81-bef5-476e-8da9-ff944bf5915e', 'GOA', 'cjch', 60000.00, '4841b1d3-60d8-4386-9718-e56c5dc44fd8',
'2025-03-28 09:08:10.753+00', '2025-03-28 09:08:10.82255+00', '#FF6B6B', 'home', null, 'BKHL7L', false);

-- Update profiles with board_id after the foreign key is added
UPDATE "public"."profiles"
SET "board_id" = '25b2cd3b-9883-4a20-9606-0d81ace5389d'
WHERE "id" = '4841b1d3-60d8-4386-9718-e56c5dc44fd8';

-- Insert expenses data
INSERT INTO "public"."expenses" (
    "id", "board_id", "category_id", "amount", "description", "date",
    "created_by", "created_at", "updated_at", "payment_method"
) VALUES
('2162c9c4-55c9-4c18-99a8-f867e353a10f', 'b7adaf81-bef5-476e-8da9-ff944bf5915e', '09264e2c-6a00-47dc-a257-dacd2a60703a',
200.00, 'dummy', '2025-03-29 06:42:14.526+00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8',
'2025-03-29 06:43:17.739701+00', '2025-03-29 06:43:17.739701+00', '2'),
('3f7cf2ed-2c90-41e3-b3c7-dd57ee493b46', '25b2cd3b-9883-4a20-9606-0d81ace5389d', '09264e2c-6a00-47dc-a257-dacd2a60703a',
10.00, 'add', '2025-03-28 03:42:22.83+00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8',
'2025-03-28 03:42:46.033643+00', '2025-03-28 03:42:46.033643+00', 'Net Banking'),
('5de3f80d-d52d-4e38-8153-9c94d7a0b619', '25b2cd3b-9883-4a20-9606-0d81ace5389d', '0d70e61f-a64a-4a34-8122-10ab43ee764d',
10.00, 'vhgg', '2025-03-28 08:02:24.053+00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8',
'2025-03-28 08:02:32.195855+00', '2025-03-28 08:02:32.195855+00', 'UPI'),
('82944e6a-341e-412d-8fa0-faf32617329c', 'b7adaf81-bef5-476e-8da9-ff944bf5915e', '09264e2c-6a00-47dc-a257-dacd2a60703a',
200.00, 'hcc bc', '2025-03-28 12:15:41.405+00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8',
'2025-03-28 12:18:38.383692+00', '2025-03-28 12:18:38.383692+00', 'Cash'),
('8dd6c564-e3c8-44ff-8148-42e8321e711f', 'b7adaf81-bef5-476e-8da9-ff944bf5915e', 'cf12df90-f7c2-4407-a3f4-951e87443990',
10.00, 'zudio', '2025-03-29 06:47:01.122+00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8',
'2025-03-29 06:47:41.363855+00', '2025-03-29 06:47:41.363855+00', 'card'),
('9c30f1f6-44cf-4d21-80d4-c3df65683e74', '511af495-874d-497a-b136-7c4e1885dbf7', '618d34a3-597d-41c4-96b8-336240d04074',
100.00, 'food', '2025-03-28 08:08:31.624+00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8',
'2025-03-28 08:08:52.752078+00', '2025-03-28 08:08:52.752078+00', 'Card'),
('e472a0ef-94cb-478f-9f23-3bbfa707cc87', '25b2cd3b-9883-4a20-9606-0d81ace5389d', '09264e2c-6a00-47dc-a257-dacd2a60703a',
10.00, 'dgc', '2025-03-26 08:45:26.891+00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8',
'2025-03-26 08:46:15.165012+00', '2025-03-26 08:46:15.165012+00', 'Card');

-- Insert notifications data
INSERT INTO "public"."notifications" (
    "id", "user_id", "type", "title", "message", "trip_name",
    "read", "icon", "icon_color", "created_at", "updated_at"
) VALUES
('478ac854-d2d1-4ba1-a248-a637df99099a', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', 'trip',
'Trip Reminder From App', 'Your trip to Paris starts in 3 days', 'Paris Vacation',
false, 'airplane', '#9C27B0', '2025-03-28 10:36:40.52376+00', '2025-03-28 10:45:37.695428+00'),
('5b41b6ea-9489-41c3-b765-c9e24432d885', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', 'budget',
'Budget Alert', 'You''re approaching your budget limit', 'Business Trip',
false, 'alert-circle', '#FFC107', '2025-03-28 10:36:40.52376+00', '2025-03-28 10:36:40.52376+00'),
('81eb09d5-94d3-49c0-a27d-480894eb01cd', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', 'expense',
'New Expense Added', 'John added a new expense of $50 for dinner', 'Summer Vacation 2024',
true, 'cash-plus', '#4CAF50', '2025-03-28 10:36:40.52376+00', '2025-03-28 10:39:15.717202+00'),
('d884e138-a0b5-4417-86b7-50d1600a4676', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', 'settlement',
'Payment Settlement', 'Alice needs to pay John $150', 'Weekend Trip',
false, 'cash-transfer', '#2196F3', '2025-03-28 10:36:40.52376+00', '2025-03-28 10:36:40.52376+00');

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
