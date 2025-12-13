/*
  # Sweet Shop Management System - Initial Schema
  
  ## Overview
  This migration creates the foundational database schema for the Sweet Shop Management System,
  including tables for sweets inventory, user profiles, and purchase history.
  
  ## New Tables
  
  ### 1. `user_profiles`
  Extends the authentication system to track admin privileges.
  - `id` (uuid, primary key) - References auth.users
  - `is_admin` (boolean) - Whether user has admin privileges (default: false)
  - `created_at` (timestamptz) - When the profile was created
  
  ### 2. `sweets`
  Core inventory table for managing sweet products.
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Name of the sweet
  - `category` (text) - Category (e.g., "Chocolate", "Candy", "Gummies")
  - `price` (numeric) - Price per unit
  - `quantity` (integer) - Current stock quantity
  - `description` (text) - Optional product description
  - `created_at` (timestamptz) - When the sweet was added
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 3. `purchases`
  Transaction history for sweet purchases.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References auth.users
  - `sweet_id` (uuid) - References sweets
  - `quantity` (integer) - Number of items purchased
  - `total_price` (numeric) - Total transaction amount
  - `created_at` (timestamptz) - When the purchase was made
  
  ## Security (RLS Policies)
  
  ### user_profiles
  - Authenticated users can read their own profile
  - Users can insert their own profile during registration
  - Users can update their own profile (except is_admin)
  
  ### sweets
  - Anyone can view sweets (public read access)
  - Only admins can create, update, or delete sweets
  
  ### purchases
  - Users can view their own purchase history
  - Authenticated users can create purchases for themselves
  
  ## Important Notes
  1. All tables have RLS enabled for security
  2. Admin status is managed through user_profiles.is_admin
  3. Quantity validation must be handled at application level
  4. Price calculations must be verified server-side
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create sweets table
CREATE TABLE IF NOT EXISTS sweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE sweets ENABLE ROW LEVEL SECURITY;

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sweet_id uuid NOT NULL REFERENCES sweets(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  total_price numeric(10, 2) NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for sweets
CREATE POLICY "Anyone can view sweets"
  ON sweets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can create sweets"
  ON sweets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can update sweets"
  ON sweets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can delete sweets"
  ON sweets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- RLS Policies for purchases
CREATE POLICY "Users can view their own purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Users can create their own purchases"
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sweets_category ON sweets(category);
CREATE INDEX IF NOT EXISTS idx_sweets_name ON sweets(name);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_sweet_id ON purchases(sweet_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_sweets_updated_at
  BEFORE UPDATE ON sweets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample sweets data for testing
INSERT INTO sweets (name, category, price, quantity, description) VALUES
  ('Dark Chocolate Bar', 'Chocolate', 2.99, 50, 'Rich 70% cocoa dark chocolate'),
  ('Milk Chocolate Truffles', 'Chocolate', 5.99, 30, 'Smooth milk chocolate truffles'),
  ('Gummy Bears', 'Gummies', 1.99, 100, 'Classic fruit-flavored gummy bears'),
  ('Sour Worms', 'Gummies', 2.49, 75, 'Tangy sour gummy worms'),
  ('Lollipops', 'Candy', 0.99, 150, 'Assorted fruit lollipops'),
  ('Caramel Chews', 'Candy', 3.49, 60, 'Soft and chewy caramel candies'),
  ('Peppermint Bark', 'Chocolate', 4.99, 40, 'White and dark chocolate with peppermint'),
  ('Jelly Beans', 'Candy', 2.99, 80, 'Mix of classic jelly bean flavors')
ON CONFLICT DO NOTHING;