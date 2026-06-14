-- Create blog-only admin users directly via SQL.
-- Replace the password before running if needed.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'blog_editor';

DO $$
DECLARE
  new_user_id UUID;
  editor_record RECORD;
BEGIN
  FOR editor_record IN
    SELECT * FROM (VALUES
      ('alexandracondulet@gmail.com', 'Alexandra Condulet'),
      ('amana.cristea@gmail.com', 'Amana Cristea')
    ) AS editors(email, full_name)
  LOOP
    SELECT id INTO new_user_id
    FROM auth.users
    WHERE email = editor_record.email;

    IF new_user_id IS NULL THEN
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
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        editor_record.email,
        crypt('change-me', gen_salt('bf')),
        now(),
        jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
        jsonb_build_object('full_name', editor_record.full_name),
        now(),
        now(),
        '',
        '',
        '',
        ''
      )
      RETURNING id INTO new_user_id;
    END IF;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'blog_editor')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (new_user_id, editor_record.email, editor_record.full_name)
    ON CONFLICT (user_id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;
  END LOOP;

END $$;
