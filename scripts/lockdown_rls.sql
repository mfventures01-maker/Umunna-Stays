-- =====================================================================
-- UMUNNA STAYS PRODUCTION DATABASE RLS LOCKDOWN
-- Run this SQL in your Supabase SQL Editor AFTER running the migration
-- script to restrict write access to authenticated admin users only.
-- =====================================================================

-- 1. Properties
DROP POLICY IF EXISTS "Public insert properties" ON public.properties;
DROP POLICY IF EXISTS "Admin write properties" ON public.properties;
CREATE POLICY "Admin write properties" ON public.properties FOR ALL USING (auth.role() = 'authenticated');

-- 2. Property Images
DROP POLICY IF EXISTS "Public insert property_images" ON public.property_images;
DROP POLICY IF EXISTS "Admin write property_images" ON public.property_images;
CREATE POLICY "Admin write property_images" ON public.property_images FOR ALL USING (auth.role() = 'authenticated');

-- 3. Food Vendors
DROP POLICY IF EXISTS "Public insert food_vendors" ON public.food_vendors;
DROP POLICY IF EXISTS "Admin write food_vendors" ON public.food_vendors;
CREATE POLICY "Admin write food_vendors" ON public.food_vendors FOR ALL USING (auth.role() = 'authenticated');

-- 4. Food Items
DROP POLICY IF EXISTS "Public insert food_items" ON public.food_items;
DROP POLICY IF EXISTS "Admin write food_items" ON public.food_items;
CREATE POLICY "Admin write food_items" ON public.food_items FOR ALL USING (auth.role() = 'authenticated');

-- 5. Transport Vendors
DROP POLICY IF EXISTS "Public insert transport_vendors" ON public.transport_vendors;
DROP POLICY IF EXISTS "Admin write transport_vendors" ON public.transport_vendors;
CREATE POLICY "Admin write transport_vendors" ON public.transport_vendors FOR ALL USING (auth.role() = 'authenticated');

-- 6. Transport Vehicles
DROP POLICY IF EXISTS "Public insert transport_vehicles" ON public.transport_vehicles;
DROP POLICY IF EXISTS "Admin write transport_vehicles" ON public.transport_vehicles;
CREATE POLICY "Admin write transport_vehicles" ON public.transport_vehicles FOR ALL USING (auth.role() = 'authenticated');

-- 7. Transport Services
DROP POLICY IF EXISTS "Public insert transport_services" ON public.transport_services;
DROP POLICY IF EXISTS "Admin write transport_services" ON public.transport_services;
CREATE POLICY "Admin write transport_services" ON public.transport_services FOR ALL USING (auth.role() = 'authenticated');
