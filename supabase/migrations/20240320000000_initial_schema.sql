-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE expense_status AS ENUM ('pending', 'settled', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'upi', 'net_banking');

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    mobile TEXT,
    avatar_url TEXT,
    has_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, mobile, avatar_url, has_notifications)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'mobile',
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE((NEW.raw_user_meta_data->>'has_notifications')::boolean, false)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create expense_boards table
CREATE TABLE expense_boards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    total_budget DECIMAL(10,2),
    created_by UUID REFERENCES auth.users ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security for expense_boards
ALTER TABLE expense_boards ENABLE ROW LEVEL SECURITY;

-- Create policies for expense_boards
CREATE POLICY "Users can view their own expense boards"
    ON expense_boards FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own expense boards"
    ON expense_boards FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own expense boards"
    ON expense_boards FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own expense boards"
    ON expense_boards FOR DELETE
    USING (auth.uid() = created_by);

-- Create categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Users can view all categories"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own categories"
    ON categories FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own categories"
    ON categories FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own categories"
    ON categories FOR DELETE
    USING (auth.uid() = created_by);

-- Create expenses table
CREATE TABLE expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    board_id UUID REFERENCES expense_boards ON DELETE CASCADE,
    category_id UUID REFERENCES categories ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES auth.users ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security for expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for expenses
CREATE POLICY "Users can view expenses in their boards"
    ON expenses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM expense_boards
            WHERE expense_boards.id = expenses.board_id
            AND expense_boards.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create expenses in their boards"
    ON expenses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM expense_boards
            WHERE expense_boards.id = expenses.board_id
            AND expense_boards.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update expenses in their boards"
    ON expenses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM expense_boards
            WHERE expense_boards.id = expenses.board_id
            AND expense_boards.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete expenses in their boards"
    ON expenses FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM expense_boards
            WHERE expense_boards.id = expenses.board_id
            AND expense_boards.created_by = auth.uid()
        )
    );

-- Create expense_participants table
CREATE TABLE expense_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    expense_id UUID REFERENCES expenses ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(expense_id, user_id)
);

-- Enable Row Level Security for expense_participants
ALTER TABLE expense_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for expense_participants
CREATE POLICY "Users can view participants in their expenses"
    ON expense_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM expenses
            JOIN expense_boards ON expense_boards.id = expenses.board_id
            WHERE expenses.id = expense_participants.expense_id
            AND expense_boards.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can manage participants in their expenses"
    ON expense_participants FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM expenses
            JOIN expense_boards ON expense_boards.id = expenses.board_id
            WHERE expenses.id = expense_participants.expense_id
            AND expense_boards.created_by = auth.uid()
        )
    );

-- Create settlements table
CREATE TABLE settlements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    board_id UUID REFERENCES expense_boards ON DELETE CASCADE,
    from_user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    to_user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security for settlements
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Create policies for settlements
CREATE POLICY "Users can view settlements in their boards"
    ON settlements FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM expense_boards
            WHERE expense_boards.id = settlements.board_id
            AND expense_boards.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can manage settlements in their boards"
    ON settlements FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM expense_boards
            WHERE expense_boards.id = settlements.board_id
            AND expense_boards.created_by = auth.uid()
        )
    );

-- Insert default categories
INSERT INTO categories (name, icon, color, is_default) VALUES
('Food', 'food', '#FF6B6B', true),
('Transport', 'car', '#4ECDC4', true),
('Shopping', 'shopping', '#45B7D1', true),
('Entertainment', 'movie', '#96CEB4', true),
('Health', 'medical-bag', '#FFEEAD', true),
('Education', 'book-open-variant', '#D4A5A5', true);
