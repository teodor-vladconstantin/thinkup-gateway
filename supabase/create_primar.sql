-- Create a new "Primar" user directly via SQL.
-- Replace email / full_name / password before running.

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
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
    'primar@exemplu.com',            -- <-- schimbă emailul
    crypt('schimba-parola', gen_salt('bf')), -- <-- schimbă parola
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Nume Primar"}',  -- <-- schimbă numele
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'primar');

  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (new_user_id, 'primar@exemplu.com', 'Nume Primar')
  ON CONFLICT (user_id) DO UPDATE
  SET full_name = EXCLUDED.full_name;

END $$;
