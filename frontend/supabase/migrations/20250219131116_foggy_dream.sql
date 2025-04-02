/*
  # Initial Schema Setup for Legal AI Platform

  1. New Tables
    - profiles: User profiles with roles
    - messages: Chat messages between users and AI
    - predefined_responses: Pre-written AI responses
    - settings: System-wide settings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Special policies for admin users
*/

-- Create profiles table first (depends on auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('lawyer', 'admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create settings table (no dependencies)
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify settings"
  ON settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create predefined_responses table (no dependencies)
CREATE TABLE IF NOT EXISTS predefined_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keywords text[] NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE predefined_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read predefined responses"
  ON predefined_responses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify predefined responses"
  ON predefined_responses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create messages table last (depends on profiles)
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  sender text NOT NULL CHECK (sender IN ('user', 'ai')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);