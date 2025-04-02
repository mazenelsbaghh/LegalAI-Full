-- Create real admin account with proper permissions
DO $$ 
DECLARE
  admin_id UUID;
BEGIN
  -- Generate UUID for admin
  admin_id := gen_random_uuid();

  -- Delete existing admin if exists
  DELETE FROM auth.users WHERE email = 'admin@legalai.com';
  DELETE FROM profiles WHERE email = 'admin@legalai.com';

  -- Create admin user with proper password hashing
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    is_super_admin
  ) VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@legalai.com',
    -- Use proper password hashing with bcrypt and high cost factor
    crypt('Admin@123!', gen_salt('bf', 12)),
    now(),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    ),
    jsonb_build_object(
      'role', 'admin',
      'is_super_admin', true
    ),
    'authenticated',
    'authenticated',
    true
  );

  -- Create admin profile with full privileges
  INSERT INTO profiles (
    id,
    email,
    role,
    full_name
  ) VALUES (
    admin_id,
    'admin@legalai.com',
    'admin',
    'System Administrator'
  );

  -- Grant all necessary permissions
  GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
  GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
END $$;