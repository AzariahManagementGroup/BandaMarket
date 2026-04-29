-- Admin and Role Management Setup

-- Add role column to profiles if it doesn't exist (signup_role exists but we want a definitive system role)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer' CHECK (role IN ('super_admin', 'admin', 'seller', 'buyer', 'logistics'));

-- Create roles_permissions table
CREATE TABLE IF NOT EXISTS public.roles_permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    role TEXT NOT NULL UNIQUE,
    modules JSONB NOT NULL DEFAULT '[]', -- List of module names the role can access
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial permissions
INSERT INTO public.roles_permissions (role, modules) VALUES
('super_admin', '["all"]'),
('admin', '["users", "marketplace", "orders", "finance", "logistics"]'),
('seller', '["marketplace", "orders"]'),
('buyer', '["marketplace", "wallet"]')
ON CONFLICT (role) DO UPDATE SET modules = EXCLUDED.modules;

-- Function to set super_admin for the specific email
-- Note: This requires the user to already exist in auth.users or it will trigger on next login if we use a trigger
-- For now, let's just make sure the profile update is easy.
CREATE OR REPLACE FUNCTION public.check_and_assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
    -- If the email matches the admin credential, set role to super_admin
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.id AND email = 'info@azariahmg.com') THEN
        NEW.role := 'super_admin';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-assign admin role on profile creation/update
DROP TRIGGER IF EXISTS on_profile_admin_check ON public.profiles;
CREATE TRIGGER on_profile_admin_check
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.check_and_assign_admin_role();

-- Update existing profile if it exists
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'info@azariahmg.com');

-- RLS for roles_permissions
ALTER TABLE public.roles_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view permissions" ON public.roles_permissions FOR SELECT USING (true);
CREATE POLICY "Only super_admins can manage permissions" ON public.roles_permissions 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Update profiles RLS to allow super_admin to view all profiles
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Allow super_admins to update roles
CREATE POLICY "Admins can update roles" ON public.profiles
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));
