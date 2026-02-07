-- Run this in Supabase SQL Editor to fix "Database error saving new user" on signup.
-- The trigger was inserting into expense_boards before profiles; expense_boards.created_by
-- references profiles(id), so the order is fixed: profile first, then board, then update profile.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_board_id UUID;
  referral_code TEXT;
  share_code TEXT;
BEGIN
  referral_code := upper(substr(md5(NEW.id::text || gen_random_uuid()::text), 1, 8));
  share_code := upper(substr(md5(gen_random_uuid()::text), 1, 6));
  default_board_id := gen_random_uuid();

  -- 1. Create profile first (board_id NULL)
  INSERT INTO public.profiles (id, full_name, email_address, mobile, avatar_url, has_notifications, is2FA, current_plan, is_google_connected, account_status, total_boards, board_id, referral_code, created_at, updated_at)
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
    0,
    NULL,
    referral_code,
    NOW(),
    NOW()
  );

  -- 2. Create default board
  INSERT INTO public.expense_boards (id, name, description, total_budget, created_by, share_code, is_default, created_at, updated_at)
  VALUES (
    default_board_id,
    'General Expenses',
    'Default board for tracking general expenses',
    0,
    NEW.id,
    share_code,
    true,
    NOW(),
    NOW()
  );

  -- 3. Link profile to default board
  UPDATE public.profiles SET board_id = default_board_id, total_boards = 1 WHERE id = NEW.id;

  -- 4. Create default categories
  INSERT INTO public.categories (name, description, icon, color, user_id, is_default, created_at, updated_at)
  VALUES
    ('Food', 'Food and dining expenses', 'food', '#FF6B6B', NEW.id, true, NOW(), NOW()),
    ('Transport', 'Transportation costs', 'car', '#4ECDC4', NEW.id, true, NOW(), NOW()),
    ('Shopping', 'Shopping and retail', 'shopping', '#45B7D1', NEW.id, true, NOW(), NOW()),
    ('Entertainment', 'Entertainment and leisure', 'movie', '#96CEB4', NEW.id, true, NOW(), NOW()),
    ('Health', 'Health and medical expenses', 'heart', '#FFEEAD', NEW.id, true, NOW(), NOW()),
    ('Education', 'Education and learning', 'book', '#D4A5A5', NEW.id, true, NOW(), NOW()),
    ('Housing', 'Housing and utilities', 'home', '#9B59B6', NEW.id, true, NOW(), NOW()),
    ('Travel', 'Travel and tourism', 'airplane', '#3498DB', NEW.id, true, NOW(), NOW());

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'handle_new_user: %', SQLERRM;
END;
$$;
