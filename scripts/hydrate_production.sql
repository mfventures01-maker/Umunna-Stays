-- =====================================================================
-- UMUNNA STAYS PRODUCTION DATABASE HYDRATION & SCHEMA ALIGNMENT
-- Run this SQL in your Supabase SQL Editor to:
-- 1. Create missing tables: food_vendors, food_items, transport_vendors,
--    transport_vehicles, transport_services
-- 2. Enable Row-Level Security (RLS) & establish SELECT/WRITE policies
-- 3. Adjust schema for existing tables (leads, profiles)
-- 4. Confirm the administrative user email & grant super_admin role
-- 5. Seed initial data for transport and food modules
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. SCHEMA ALIGNMENT (ALTERING EXISTING TABLES)
-- ---------------------------------------------------------------------

-- Adjust public.leads table (for Concierge and Transport leads)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS service_type text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS details jsonb;

-- Adjust public.profiles table (for Auth & Session management)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;


-- ---------------------------------------------------------------------
-- 2. CREATE NEW TABLES
-- ---------------------------------------------------------------------

-- Create public.food_vendors
CREATE TABLE IF NOT EXISTS public.food_vendors (
    vendor_id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    menu_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create public.food_items
CREATE TABLE IF NOT EXISTS public.food_items (
    dish_id text PRIMARY KEY,
    vendor_id text REFERENCES public.food_vendors(vendor_id) ON DELETE CASCADE,
    dish_name text NOT NULL,
    description text,
    image_url text,
    price_ngn numeric NOT NULL,
    is_available text DEFAULT 'Yes',
    category text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create public.transport_vendors
CREATE TABLE IF NOT EXISTS public.transport_vendors (
    vendor_id text PRIMARY KEY,
    vendor_name text NOT NULL,
    service_types text[] DEFAULT '{}'::text[],
    coverage_cities text[] DEFAULT '{}'::text[],
    whatsapp_number text,
    whatsapp_prefill text,
    logo_url text,
    primary_contact_name text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.transport_vendors DROP COLUMN IF EXISTS coverage_cities;
ALTER TABLE public.transport_vendors ADD COLUMN IF NOT EXISTS coverage_cities text[] DEFAULT '{}'::text[];

-- Create public.transport_vehicles
CREATE TABLE IF NOT EXISTS public.transport_vehicles (
    vehicle_id text PRIMARY KEY,
    vendor_id text REFERENCES public.transport_vendors(vendor_id) ON DELETE CASCADE,
    vehicle_type text NOT NULL,
    make_model text NOT NULL,
    category text NOT NULL,
    seats integer DEFAULT 4,
    features text,
    daily_rate_ngn text,
    image_url text,
    is_available text DEFAULT 'Yes',
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create public.transport_services
CREATE TABLE IF NOT EXISTS public.transport_services (
    service_id text PRIMARY KEY,
    vendor_id text REFERENCES public.transport_vendors(vendor_id) ON DELETE CASCADE,
    service_type text NOT NULL,
    service_title text NOT NULL,
    description text,
    starting_price_ngn text,
    pricing_unit text DEFAULT 'per_day',
    lead_time_hours integer DEFAULT 0,
    includes text,
    excludes text,
    available_24_7 text DEFAULT 'Yes',
    is_active text DEFAULT 'Yes',
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ---------------------------------------------------------------------
-- 3. ENABLE ROW LEVEL SECURITY & DEFINE POLICIES
-- ---------------------------------------------------------------------

-- Enable RLS on new tables
ALTER TABLE public.food_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_services ENABLE ROW LEVEL SECURITY;

-- Enable RLS on existing tables
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to make it repeatable)
DROP POLICY IF EXISTS "Public read food_vendors" ON public.food_vendors;
DROP POLICY IF EXISTS "Public read food_items" ON public.food_items;
DROP POLICY IF EXISTS "Public read transport_vendors" ON public.transport_vendors;
DROP POLICY IF EXISTS "Public read transport_vehicles" ON public.transport_vehicles;
DROP POLICY IF EXISTS "Public read transport_services" ON public.transport_services;
DROP POLICY IF EXISTS "Public read properties" ON public.properties;
DROP POLICY IF EXISTS "Public read property_images" ON public.property_images;
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;

DROP POLICY IF EXISTS "Public insert properties" ON public.properties;
DROP POLICY IF EXISTS "Public insert property_images" ON public.property_images;
DROP POLICY IF EXISTS "Public insert food_vendors" ON public.food_vendors;
DROP POLICY IF EXISTS "Public insert food_items" ON public.food_items;
DROP POLICY IF EXISTS "Public insert transport_vendors" ON public.transport_vendors;
DROP POLICY IF EXISTS "Public insert transport_vehicles" ON public.transport_vehicles;
DROP POLICY IF EXISTS "Public insert transport_services" ON public.transport_services;

DROP POLICY IF EXISTS "Public insert leads" ON public.leads;
DROP POLICY IF EXISTS "Admin read/write leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON public.profiles;

-- Create SELECT policies (allow anyone/anonymous users to read catalog)
CREATE POLICY "Public read food_vendors" ON public.food_vendors FOR SELECT USING (true);
CREATE POLICY "Public read food_items" ON public.food_items FOR SELECT USING (true);
CREATE POLICY "Public read transport_vendors" ON public.transport_vendors FOR SELECT USING (true);
CREATE POLICY "Public read transport_vehicles" ON public.transport_vehicles FOR SELECT USING (true);
CREATE POLICY "Public read transport_services" ON public.transport_services FOR SELECT USING (true);
CREATE POLICY "Public read properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Public read property_images" ON public.property_images FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

-- Create temporary public insert/update/delete policies to allow anon client data migration
CREATE POLICY "Public insert properties" ON public.properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public insert property_images" ON public.property_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public insert food_vendors" ON public.food_vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public insert food_items" ON public.food_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public insert transport_vendors" ON public.transport_vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public insert transport_vehicles" ON public.transport_vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public insert transport_services" ON public.transport_services FOR ALL USING (true) WITH CHECK (true);

-- Create permanent leads policies (allow anonymous submission of bookings, admin access)
CREATE POLICY "Public insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read/write leads" ON public.leads FOR ALL USING (auth.role() = 'authenticated');

-- Create permanent profiles policies
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can do everything on profiles" ON public.profiles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
  )
);


-- ---------------------------------------------------------------------
-- 4. ADMINISTRATIVE ACCOUNT AUTHENTICATION ACTIVATION
-- ---------------------------------------------------------------------

-- Confirm admin@umunnastays.com.ng email address to allow sign in
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'admin@umunnastays.com.ng';

-- Insert admin profile with super_admin permissions linked to the user ID
INSERT INTO public.profiles (id, role, full_name, email)
SELECT id, 'super_admin', 'Umunna Admin', 'admin@umunnastays.com.ng'
FROM auth.users
WHERE email = 'admin@umunnastays.com.ng'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin', email = 'admin@umunnastays.com.ng';


-- ---------------------------------------------------------------------
-- 5. INITIAL DATA SEEDING (COMPATIBLE & RE-RUNNABLE)
-- ---------------------------------------------------------------------

-- Seed Food Vendors
INSERT INTO public.food_vendors (vendor_id, name, description, menu_url)
VALUES (
    'V_001', 
    'Judith Amazing Kitchen', 
    'Authentic local delicacies delivered to your stay across Asaba, Benin, and Awka.', 
    'https://drive.google.com/drive/folders/1a63MYdjZ7XP1JsFqVuJfldByca18OQ0D?usp=drive_link'
) ON CONFLICT (vendor_id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, menu_url = EXCLUDED.menu_url;

-- Seed Food Items (Dishes)
INSERT INTO public.food_items (dish_id, vendor_id, dish_name, description, price_ngn, image_url, category, is_available, sort_order)
VALUES 
('JAK_002', 'V_001', 'Jollof Rice & Diced Chicken', 'Rich Jollof rice served with spicy diced chicken and plantains.', 7500, 'https://i.postimg.cc/GmkJdbL4/Jollof-rice-chicken-and-diced-plantains-).jpg', 'Main Course', 'Yes', 1),
('JAK_003', 'V_001', 'Peppered Fish', 'Freshly grilled fish coated with a spicy African pepper sauce.', 13000, 'https://i.postimg.cc/SKX4nQs8/fish-pepper-tilapia.jpg', 'Main Course', 'Yes', 2),
('JAK_004', 'V_001', 'Stew Jollof (Family Tray)', 'Large tray of special Jollof rice with premium beef stew.', 50000, 'https://i.postimg.cc/7ZMQHFwv/stew-jollof-wholesale.jpg', 'Platters', 'Yes', 3),
('JAK_006', 'V_001', 'Rich Egusi Soup', 'Traditional melon seed soup with assorted meat and fish.', 2500, 'https://i.postimg.cc/257wFrMx/Egusi-soup.jpg', 'Soups', 'Yes', 4),
('JAK_007', 'V_001', 'Okra Soup', 'Slimy okra soup with fresh seafood and traditional spices.', 3000, 'https://i.postimg.cc/vHn5tG6f/Okra-Soup.jpg', 'Soups', 'Yes', 5),
('JAK_008', 'V_001', 'White Soup (Ofe Nsala)', 'Spicy yam-thickened soup, a signature Igbo delicacy.', 10500, 'https://i.postimg.cc/xCqsPqHz/White-soup.jpg', 'Soups', 'Yes', 6),
('JAK_012', 'V_001', 'Moimoi Elewe', 'Steamed bean pudding wrapped in local leaves for extra flavor.', 2000, 'https://i.postimg.cc/tJZWfjSL/Moi-Moi-Elewe.jpg', 'Sides', 'Yes', 7),
('JAK_013', 'V_001', 'Fried Plantain', 'Sweet, ripened plantains fried to golden perfection.', 1000, 'https://i.postimg.cc/JzcJSKxh/Plantain-4-ja1w7o.webp', 'Sides', 'Yes', 8)
ON CONFLICT (dish_id) DO UPDATE 
SET dish_name = EXCLUDED.dish_name, description = EXCLUDED.description, price_ngn = EXCLUDED.price_ngn, image_url = EXCLUDED.image_url, category = EXCLUDED.category, is_available = EXCLUDED.is_available, sort_order = EXCLUDED.sort_order;

-- Seed Transport Vendors
INSERT INTO public.transport_vendors (vendor_id, vendor_name, service_types, coverage_cities, whatsapp_number, whatsapp_prefill, logo_url, primary_contact_name, is_active, sort_order)
VALUES (
    'UMR_001', 
    'Umunna Rides', 
    ARRAY['car_hire','car_hire_escort','escort_only','private_jet']::text[], 
    ARRAY['Asaba','Benin','Lagos','Portharcourt','Uyo','Abuja']::text[], 
    '+2347048033575', 
    'Hello Umunna Stays, I need transport service: [service_type] in [city] on [date]. Pickup: [pickup_location].', 
    'https://i.postimg.cc/gk40BMZB/umunna-logo.png', 
    'Concierge Lead', 
    true, 
    1
) ON CONFLICT (vendor_id) DO UPDATE 
SET vendor_name = EXCLUDED.vendor_name, service_types = EXCLUDED.service_types, coverage_cities = EXCLUDED.coverage_cities, whatsapp_number = EXCLUDED.whatsapp_number, whatsapp_prefill = EXCLUDED.whatsapp_prefill, logo_url = EXCLUDED.logo_url, primary_contact_name = EXCLUDED.primary_contact_name, is_active = EXCLUDED.is_active, sort_order = EXCLUDED.sort_order;

-- Seed Transport Vehicles
INSERT INTO public.transport_vehicles (vehicle_id, vendor_id, vehicle_type, make_model, category, seats, features, daily_rate_ngn, image_url, is_available, sort_order)
VALUES 
('UMRV_001', 'UMR_001', 'SUV', 'Toyota Prado', 'SUV', 7, 'Leather seats|AC|Airport-ready', 'From 320000', 'https://i.postimg.cc/FRsy8Drz/Save_Inta_com_488621108_18021914246690295_5868630574891386945_n.jpg', 'Yes', 1),
('UMRV_002', 'UMR_001', 'Sedan', 'Toyota Camry', 'Sedan', 5, 'AC|Comfort ride', 'From 170000', 'https://i.postimg.cc/nLFLL99Z/toyota-camry-silver.jpg', 'Yes', 2),
('UMRV_003', 'UMR_001', 'Bus', 'Hiace Bus', 'Van', 14, 'Group movement|AC optional', 'From 320000', 'https://i.postimg.cc/VNh5HL5w/haice.jpg', 'Yes', 3),
('UMRV_004', 'UMR_001', 'Escort Car', 'Toyota Hilux', 'Escort', 5, 'Convoy lead/support', 'From 320000', 'https://i.postimg.cc/Vk1nfsq9/hilux.jpg', 'Yes', 4),
('UMRV_005', 'UMR_001', 'SEINNA', 'Toyota Seinna', 'Van', 6, 'AC|Comfort ride', 'From 320000', 'https://i.postimg.cc/c41ZwGL4/Rob-and-Kerri-s-new-Toyota-Sienna.jpg', 'Check Availability', 5),
('UMRV_006', 'UMR_001', 'Bombardier Global 8000', 'Bombardier Global 8000', 'private jet', 8, 'Premium', 'Premium', 'https://i.postimg.cc/hvPp51CH/PRIVATE_JET.jpg https://i.postimg.cc/y8wp89dz/CHAMGNE_PJ.jpg', 'Yes', 6)
ON CONFLICT (vehicle_id) DO UPDATE 
SET make_model = EXCLUDED.make_model, category = EXCLUDED.category, seats = EXCLUDED.seats, features = EXCLUDED.features, daily_rate_ngn = EXCLUDED.daily_rate_ngn, image_url = EXCLUDED.image_url, is_available = EXCLUDED.is_available, sort_order = EXCLUDED.sort_order;

-- Seed Transport Services
INSERT INTO public.transport_services (service_id, vendor_id, service_type, service_title, description, starting_price_ngn, pricing_unit, lead_time_hours, includes, excludes, available_24_7, is_active, sort_order)
VALUES 
('TRS_001', 'UMR_001', 'car_hire', 'Car Hire (Self/Chauffeur)', 'Comfortable city rides for errands or daily movement.', 'Starting from 100000', 'per_day', 12, 'Driver|Fuel optional|AC', 'Tolls|Parking', 'Yes', 'Yes', 1),
('TRS_002', 'UMR_001', 'car_hire_escort', 'Car Hire + Escort Service', 'Convoy support + professional escort for VIP movement.', 'Starting from 500000', 'per_day', 12, 'Lead car|Escort team|Route planning', 'Hotel security', 'Yes', 'Yes', 2)
ON CONFLICT (service_id) DO UPDATE 
SET service_title = EXCLUDED.service_title, description = EXCLUDED.description, starting_price_ngn = EXCLUDED.starting_price_ngn, pricing_unit = EXCLUDED.pricing_unit, lead_time_hours = EXCLUDED.lead_time_hours, includes = EXCLUDED.includes, excludes = EXCLUDED.excludes, available_24_7 = EXCLUDED.available_24_7, is_active = EXCLUDED.is_active, sort_order = EXCLUDED.sort_order;
