-- Drop existing users and profiles
DELETE FROM auth.users WHERE email IN ('lawyer@example.com', 'admin@example.com');
DELETE FROM public.profiles WHERE email IN ('lawyer@example.com', 'admin@example.com');

-- Create function to safely create users
CREATE OR REPLACE FUNCTION create_user_safely(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT
) RETURNS uuid AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Generate UUID
  new_user_id := gen_random_uuid();
  
  -- Create auth user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    user_email,
    crypt(user_password, gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    ),
    '{}'::jsonb,
    'authenticated',
    'authenticated'
  );

  -- Create profile
  INSERT INTO profiles (id, email, role)
  VALUES (new_user_id, user_email, user_role);

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create test users
SELECT create_user_safely('lawyer@example.com', 'lawyer123', 'lawyer');
SELECT create_user_safely('admin@example.com', 'admin123', 'admin');

-- Drop function
DROP FUNCTION create_user_safely;