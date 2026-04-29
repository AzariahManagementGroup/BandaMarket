-- Seed Super Admin User directly into Auth
-- Using pgcrypto to hash the password for compatibility with Supabase Auth

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ 
DECLARE 
    v_user_id UUID := gen_random_uuid();
    -- Admin@webmaster$1 hashed with bcrypt (Blowfish)
    v_encrypted_pw TEXT := crypt('Admin@webmaster$1', gen_salt('bf'));
    v_email TEXT := 'info@azariahmg.com';
BEGIN 
    -- 1. Check if user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
        RETURN;
    END IF;

    -- 2. Insert into auth.users
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, 
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
        created_at, updated_at, confirmation_token, email_change_confirm_status
    ) VALUES (
        v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 
        'authenticated', v_email, v_encrypted_pw, NOW(), 
        '{"provider":"email","providers":["email"]}', 
        '{"full_name": "CameMark Super Admin", "signup_role": "admin"}', 
        NOW(), NOW(), '', 0
    );

    -- 3. Insert into auth.identities
    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, 
        last_sign_in_at, created_at, updated_at
    ) VALUES (
        v_user_id, v_user_id, 
        format('{"sub": "%s", "email": "%s"}', v_user_id, v_email)::jsonb, 
        'email', v_user_id, NOW(), NOW(), NOW()
    );

    -- 4. The profile trigger will automatically create the profile, 
    -- but we ensure the role is set correctly just in case.
    -- (Wait, the trigger in admin_setup.sql will handle this on insert)
END $$;
