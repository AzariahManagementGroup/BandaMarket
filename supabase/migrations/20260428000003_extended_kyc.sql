-- Update profiles table for extended KYC
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS id_type TEXT,
ADD COLUMN IF NOT EXISTS id_expiry DATE,
ADD COLUMN IF NOT EXISTS issuing_country TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS proof_of_address_url TEXT,
ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'verified', 'rejected'));

-- Ensure avatars bucket exists (via SQL if possible, but usually done via dashboard or API)
-- Here we just ensure we have the columns.

-- Update wallets to support currency changes
-- No changes needed, but we should ensure the currency can be updated.
