
-- Create a new admin user directly via SQL
-- Password will be: admin123
-- Email: duku.constantin@gmail.com

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- 1. Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'duku.constantin@gmail.com',
    crypt('admin123', gen_salt('bf')), -- Password: admin123
    now(), -- Confirmed immediately
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Duku Constantin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- 2. Assign super_admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'super_admin');

  -- 3. Ensure profile exists (trigger might catch it, but safe to update or insert if missing)
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (new_user_id, 'duku.constantin@gmail.com', 'Duku Constantin')
  ON CONFLICT (user_id) DO UPDATE
  SET full_name = EXCLUDED.full_name;

END $$;
