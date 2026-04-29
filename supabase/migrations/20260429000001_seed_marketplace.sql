-- Seed Marketplace Data

-- Categories
INSERT INTO public.categories (name, slug, description) VALUES
('Agriculture', 'agriculture', 'Fresh farm produce directly from Cameroonian farmers'),
('Fashion', 'fashion', 'Authentic Toghu, Kaba, and modern Cameroonian designs'),
('Electronics', 'electronics', 'Quality gadgets and electronics with local warranty'),
('Handicrafts', 'handicrafts', 'Hand-carved art and traditional crafts')
ON CONFLICT (slug) DO NOTHING;

-- Since we don't have a specific seller ID, we'll try to find any existing profile or skip
-- However, for the marketplace to be "active", we need at least one seller.
-- I'll use the super_admin email's ID if it exists, or just leave categories for now.
-- Actually, let's create a dummy seller if needed, but better to just ensure the UI handles it.

-- Update MarketZone.tsx to show categories if no products exist? 
-- No, let's just make sure the page is reachable.
