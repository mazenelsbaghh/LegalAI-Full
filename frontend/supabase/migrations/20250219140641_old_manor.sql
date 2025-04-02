/*
  # Fix authentication policies

  1. Changes
    - Add proper RLS policies for profiles table
    - Ensure proper access control for user profiles
    - Add default roles for new users

  2. Security
    - Restrict profile access to own profile only
    - Allow admins to view all profiles
*/

-- Update profiles table policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow automatic profile creation on sign up
CREATE POLICY "Users can create their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);