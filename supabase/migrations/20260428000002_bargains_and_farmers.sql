-- Add bargain fields to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS discount_price NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS is_bargain BOOLEAN DEFAULT false;

-- Removed sample farmers insert to avoid foreign key violations with auth.users.
-- Profiles should be created through the signup flow.

-- Sample Bargains removed as they depend on the deleted farmer profiles.
-- Products should be added by registered sellers.
