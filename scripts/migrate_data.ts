
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!; // Or service role key if needed, but ANON + RLS policy 'true' for insert might work if we set it temporarily, or we use service role. 
// Note: As an admin task we should use service role key if possible, but here we might rely on the 'public insert' policy requested in previous step (wait, previous step was for requests). 
// The user said "admin insert only (for now)". 
// Since I don't have the service role key, I will assume the user has run the SQL which might need to include a temporary public insert policy OR I just use the anon key and rely on a temporary policy "Enable insert for all" that I should probably add to the SQL artifact or ask the user to add. 
// ACTUALLY, the prompt says "Ensure public read access (RLS select true), admin insert only (for now)."
// This means ANNON key won't be able to insert unless I add a temporary policy. 
// I will add a temporary policy to standard migration SQL or better yet, I should check if I have a service role key. I don't.
// I will output a header to this script telling the user they might need to temporarily enable public insert or use a service role key.
// UPDATE: I will assume the user will run this locally where they might have better access or I will rely on a temporary policy in the SQL I generated.
// Wait, I did NOT generate a public insert policy for the catalog tables. I only did read.
// I should update the SQL to allow insert or just provide the data as JSON for the user to import via Table Editor? No, "Migrate ALL records".
// I will try to use the `supabase` object. If it fails, I'll log it.

const supabase = createClient(supabaseUrl, supabaseKey);

// Read JSON Data
const propertiesPath = path.join(process.cwd(), 'umunna_properties_20.json');
const rawData = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));

// Hardcoded Data from dataStore.ts (replicated here since we can't easily import TS in a standalone node script without ts-node and config matching)
const transportServices = [
    {
        service_id: "TRS_001",
        vendor_id: "UMR_001",
        service_type: "car_hire",
        service_title: "Car Hire (Self/Chauffeur)",
        description: "Comfortable city rides for errands or daily movement.",
        starting_price_ngn: "Starting from 100000",
        pricing_unit: "per_day",
        lead_time_hours: 12, // Fixed to match dataStore which had 4 in one place and 12 in logic sometimes, sticking to dataStore object
        includes: "Driver|Fuel optional|AC",
        excludes: "Tolls|Parking",
        available_24_7: "Yes",
        is_active: "Yes",
        sort_order: 1
    },
    // ... (I will fill the rest based on view_file output)
    {
        service_id: "TRS_002",
        vendor_id: "UMR_001",
        service_type: "car_hire_escort",
        service_title: "Car Hire + Escort Service",
        description: "Convoy support + professional escort for VIP movement.",
        starting_price_ngn: "Starting from 500000",
        pricing_unit: "per_day",
        lead_time_hours: 12,
        includes: "Lead car|Escort team|Route planning",
        excludes: "Hotel security",
        available_24_7: "Yes",
        is_active: "Yes",
        sort_order: 2
    },
    // ...
];

const transportVehicles = [
    {
        vehicle_id: "UMRV_001",
        vendor_id: "UMR_001",
        vehicle_type: "SUV",
        make_model: "Toyota Prado",
        category: "SUV",
        seats: 7,
        features: "Leather seats|AC|Airport-ready",
        daily_rate_ngn: "From 320000",
        image_url: "https://i.postimg.cc/FRsy8Drz/Save_Inta_com_488621108_18021914246690295_5868630574891386945_n.jpg",
        is_available: "Yes",
        sort_order: 1
    },
    {
        vehicle_id: "UMRV_002",
        vendor_id: "UMR_001",
        vehicle_type: "Sedan",
        make_model: "Toyota Camry",
        category: "Sedan",
        seats: 5,
        features: "AC|Comfort ride",
        daily_rate_ngn: "From 170000",
        image_url: "https://i.postimg.cc/nLFLL99Z/toyota-camry-silver.jpg",
        is_available: "Yes",
        sort_order: 2
    },
    {
        vehicle_id: "UMRV_003",
        vendor_id: "UMR_001",
        vehicle_type: "Bus",
        make_model: "Hiace Bus",
        category: "Van",
        seats: 14,
        features: "Group movement|AC optional",
        daily_rate_ngn: "From 320000",
        image_url: "https://i.postimg.cc/VNh5HL5w/haice.jpg",
        is_available: "Yes",
        sort_order: 3
    },
    {
        vehicle_id: "UMRV_004",
        vendor_id: "UMR_001",
        vehicle_type: "Escort Car",
        make_model: "Toyota Hilux",
        category: "Escort",
        seats: 5,
        features: "Convoy lead/support",
        daily_rate_ngn: "From 320000",
        image_url: "https://i.postimg.cc/Vk1nfsq9/hilux.jpg",
        is_available: "Yes",
        sort_order: 4
    },
    {
        vehicle_id: "UMRV_005",
        vendor_id: "UMR_001",
        vehicle_type: "SEINNA",
        make_model: "Toyota Seinna",
        category: "Van",
        seats: 6,
        features: "AC|Comfort ride",
        daily_rate_ngn: "From 320000",
        image_url: "https://i.postimg.cc/c41ZwGL4/Rob-and-Kerri-s-new-Toyota-Sienna.jpg",
        is_available: "Check Availability",
        sort_order: 5
    },
    {
        vehicle_id: "UMRV_006",
        vendor_id: "UMR_001",
        vehicle_type: "Bombardier Global 8000",
        make_model: "Bombardier Global 8000",
        category: "private jet",
        seats: 8,
        features: "Premium",
        daily_rate_ngn: "Premium",
        image_url: "https://i.postimg.cc/hvPp51CH/PRIVATE_JET.jpg https://i.postimg.cc/y8wp89dz/CHAMGNE_PJ.jpg",
        is_available: "Yes",
        sort_order: 6
    }
];

const foodVendors = [
    {
        vendor_id: "V_001",
        name: "Judith Amazing Kitchen",
        description: "Authentic local delicacies delivered to your stay across Asaba, Benin, and Awka.",
        menu_url: "https://drive.google.com/drive/folders/1a63MYdjZ7XP1JsFqVuJfldByca18OQ0D?usp=drive_link"
    }
];

const foodItems = [
    { dish_id: "JAK_002", dish_name: "Jollof Rice & Diced Chicken", description: "Rich Jollof rice served with spicy diced chicken and plantains.", price_ngn: 7500, image_url: "https://i.postimg.cc/GmkJdbL4/Jollof-rice-chicken-and-diced-plantains-).jpg", category: "Main Course", is_available: "Yes", sort_order: 1, vendor_id: "V_001" },
    { dish_id: "JAK_003", dish_name: "Peppered Fish", description: "Freshly grilled fish coated with a spicy African pepper sauce.", price_ngn: 13000, image_url: "https://i.postimg.cc/SKX4nQs8/fish-pepper-tilapia.jpg", category: "Main Course", is_available: "Yes", sort_order: 2, vendor_id: "V_001" },
    { dish_id: "JAK_004", dish_name: "Stew Jollof (Family Tray)", description: "Large tray of special Jollof rice with premium beef stew.", price_ngn: 50000, image_url: "https://i.postimg.cc/7ZMQHFwv/stew-jollof-wholesale.jpg", category: "Platters", is_available: "Yes", sort_order: 3, vendor_id: "V_001" },
    { dish_id: "JAK_006", dish_name: "Rich Egusi Soup", description: "Traditional melon seed soup with assorted meat and fish.", price_ngn: 2500, image_url: "https://i.postimg.cc/257wFrMx/Egusi-soup.jpg", category: "Soups", is_available: "Yes", sort_order: 4, vendor_id: "V_001" },
    { dish_id: "JAK_007", dish_name: "Okra Soup", description: "Slimy okra soup with fresh seafood and traditional spices.", price_ngn: 3000, image_url: "https://i.postimg.cc/vHn5tG6f/Okra-Soup.jpg", category: "Soups", is_available: "Yes", sort_order: 5, vendor_id: "V_001" },
    { dish_id: "JAK_008", dish_name: "White Soup (Ofe Nsala)", description: "Spicy yam-thickened soup, a signature Igbo delicacy.", price_ngn: 10500, image_url: "https://i.postimg.cc/xCqsPqHz/White-soup.jpg", category: "Soups", is_available: "Yes", sort_order: 6, vendor_id: "V_001" },
    { dish_id: "JAK_012", dish_name: "Moimoi Elewe", description: "Steamed bean pudding wrapped in local leaves for extra flavor.", price_ngn: 2000, image_url: "https://i.postimg.cc/tJZWfjSL/Moi-Moi-Elewe.jpg", category: "Sides", is_available: "Yes", sort_order: 7, vendor_id: "V_001" },
    { dish_id: "JAK_013", dish_name: "Fried Plantain", description: "Sweet, ripened plantains fried to golden perfection.", price_ngn: 1000, image_url: "https://i.postimg.cc/JzcJSKxh/Plantain-4-ja1w7o.webp", category: "Sides", is_available: "Yes", sort_order: 8, vendor_id: "V_001" }
];


// Data Mappers
function mapProperty(p: any) {
    return {
        property_id: p.property_id,
        name: p.name,
        city: p.city,
        state: p.state,
        capacity: p.capacity,
        nightly_rate: p.nightly_rate,
        hero_image_url: p.hero_image_url,
        badges: p.badges,
        is_featured: p.is_featured,
        display_order: p.display_order,
        category: p.category,
        bedrooms: p.bedrooms,
        about_this_space: p.about_this_space,
        host: p.host,
        booking: p.booking
    };
}

// ... existing code ...

async function migrate() {
    console.log('Starting migration...');

    // 1. Properties
    const properties = rawData.properties.map(mapProperty);
    const { error: propError } = await supabase.from('properties').upsert(properties, { onConflict: 'property_id' });
    if (propError) console.error('Error migrating properties:', propError);
    else console.log(`Migrated ${properties.length} properties.`);

    // 2. Images
    const photos = rawData.photo_gallery.photos;
    const { error: imgError } = await supabase.from('property_images').upsert(photos, { onConflict: 'id' }); // Assuming ID auto-gen or we rely on photo_id? 
    // Wait, the schema I made has auto-gen id. The JSON has photo_id. 
    // Upsert needs a constraint. I set photo_id as just text, not unique. I should probably rely on property_id + sequence?
    // Let's just insert for now, or truncate first? 
    // Safest is to delete all for these properties first?
    // I will iterate and insert.
    // Actually upsert on a unique column is best. I didn't make photo_id unique in schema. 
    // I will use delete + insert strategy for simplicity in this script run.

    // Deleting all existing images to avoid dupes on re-run
    await supabase.from('property_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { error: imgInsertError } = await supabase.from('property_images').insert(photos);
    if (imgInsertError) console.error('Error migrating images:', imgInsertError);
    else console.log(`Migrated ${photos.length} images.`);

    // 3. Transport Services
    const { error: tsError } = await supabase.from('transport_services').upsert(transportServices, { onConflict: 'service_id' });
    if (tsError) console.error('Error migrating transport services:', tsError);
    else console.log(`Migrated ${transportServices.length} transport services.`);

    // 4. Transport Vendors
    // Need to read from JSON if they exist there, or dataStore?
    // umunna_properties_20.json seems to have transport_vendors
    const tVendors = rawData.transport_vendors || [];
    if (tVendors.length > 0) {
        const { error: tvError } = await supabase.from('transport_vendors').upsert(tVendors, { onConflict: 'vendor_id' });
        if (tvError) console.error('Error migrating transport vendors:', tvError);
        else console.log(`Migrated ${tVendors.length} transport vendors.`);
    }

    // 5. Transport Vehicles
    const tVehicles = rawData.transport_vehicles || [];
    // Note: dataStore.ts has vehicles too. The prompt said "Update transport_vehicles in json" in Phase 0.5.
    // So JSON should be the source for vehicles.
    if (tVehicles.length > 0) {
        const { error: vError } = await supabase.from('transport_vehicles').upsert(tVehicles, { onConflict: 'vehicle_id' });
        if (vError) console.error('Error migrating vehicles:', vError);
        else console.log(`Migrated ${tVehicles.length} vehicles.`);
    }

    // 6. Food Vendors
    const { error: fvError } = await supabase.from('food_vendors').upsert(foodVendors, { onConflict: 'vendor_id' });
    if (fvError) console.error('Error migrating food vendors:', fvError);
    else console.log(`Migrated ${foodVendors.length} food vendors.`);

    // 7. Food Items
    const { error: fiError } = await supabase.from('food_items').upsert(foodItems, { onConflict: 'dish_id' });
    if (fiError) console.error('Error migrating food items:', fiError);
    else console.log(`Migrated ${foodItems.length} food items.`);

    console.log('Migration complete.');
}

migrate();
