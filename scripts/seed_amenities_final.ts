
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Define Master List with Conversion Ranking
const MASTER_AMENITIES = [
    // TIER 1: Decision Triggers (Rank 1-10)
    { name: '24/7 Power', category: 'Power', sort_rank: 1, icon: 'Zap' },
    { name: 'Inverter', category: 'Power', sort_rank: 2, icon: 'Battery' },
    { name: 'Solar Power', category: 'Power', sort_rank: 2, icon: 'Sun' },
    { name: 'Jacuzzi', category: 'Wellness', sort_rank: 3, icon: 'Waves' },
    { name: 'Pool', category: 'Wellness', sort_rank: 4, icon: 'Waves' },
    { name: 'Private Pool', category: 'Wellness', sort_rank: 4, icon: 'Waves' },
    { name: 'Poolside', category: 'Wellness', sort_rank: 5, icon: 'Waves' },
    { name: 'Waterfront Garden', category: 'Outdoors', sort_rank: 6, icon: 'TreePine' },
    { name: 'Secure', category: 'Safety', sort_rank: 7, icon: 'ShieldCheck' },
    { name: 'Safe Neighborhood', category: 'Safety', sort_rank: 8, icon: 'Shield' },
    { name: 'Gated Estate', category: 'Safety', sort_rank: 8, icon: 'Gate' },

    // TIER 2: Differentiators (Rank 11-30)
    { name: 'Cinema', category: 'Entertainment', sort_rank: 11, icon: 'Clapperboard' }, // Projector -> Clapperboard or Tv
    { name: 'PS5', category: 'Entertainment', sort_rank: 12, icon: 'Gamepad2' },
    { name: 'Snooker', category: 'Entertainment', sort_rank: 13, icon: 'Target' },
    { name: 'Pool Table', category: 'Entertainment', sort_rank: 13, icon: 'Target' },
    { name: 'Games Lounge', category: 'Entertainment', sort_rank: 14, icon: 'Gamepad' },
    { name: 'Smart Home', category: 'Smart Tech', sort_rank: 15, icon: 'Cpu' },
    { name: 'High-Speed Wi-Fi', category: 'Connectivity', sort_rank: 16, icon: 'Wifi' },
    { name: 'Free Wi-Fi', category: 'Connectivity', sort_rank: 16, icon: 'Wifi' },
    { name: 'Premium Furniture', category: 'Comfort', sort_rank: 20, icon: 'Sofa' },
    { name: 'Art Decor', category: 'Design', sort_rank: 21, icon: 'Palette' },

    // TIER 3: Basics (Rank 50+)
    { name: 'Modern Living', category: 'Comfort', sort_rank: 50, icon: 'Home' },
    { name: 'Clean Basics', category: 'Comfort', sort_rank: 51, icon: 'Sparkles' },
    { name: 'Fully Equipped Kitchen', category: 'Kitchen', sort_rank: 52, icon: 'Utensils' },
    { name: 'Air Conditioning', category: 'Comfort', sort_rank: 53, icon: 'Wind' },
    { name: 'Hot Water', category: 'Bathroom', sort_rank: 54, icon: 'Droplets' },
    { name: 'Dining Area', category: 'Dining', sort_rank: 55, icon: 'UtensilsCrossed' },
    { name: 'Parking', category: 'Outdoors', sort_rank: 60, icon: 'Car' },

    // Extra mapping for existing badges from JSON
    { name: 'Luxury Duplex', category: 'Comfort', sort_rank: 10, icon: 'Home' },
    { name: 'Private Entrance', category: 'Safety', sort_rank: 56, icon: 'Key' },
    { name: 'Concierge', category: 'Service', sort_rank: 57, icon: 'UserCheck' },
    { name: 'Business Stay', category: 'Productivity', sort_rank: 58, icon: 'Briefcase' },
    { name: 'Anambra Stays', category: 'Location', sort_rank: 59, icon: 'MapPin' }
];

async function seedAmenities() {
    console.log('--- Seeding Amenities ---');

    // 1. Upsert Master Amenities
    console.log('Upserting Master Amenities...');
    const { data: masterData, error: masterError } = await supabase
        .from('amenities_master')
        .upsert(MASTER_AMENITIES.map(a => ({
            name: a.name,
            category: a.category,
            sort_rank: a.sort_rank,
            icon_name: a.icon
        })), { onConflict: 'name' })
        .select();

    if (masterError) {
        console.error('Error seeding master:', masterError);
        return;
    }

    // Create a map for quick ID lookup
    const amenityMap = new Map();
    masterData.forEach(a => amenityMap.set(a.name, a.id));

    // 2. Map Properties to Amenities using 'badges'
    const propertiesPath = path.join(process.cwd(), 'umunna_properties_20.json');
    const rawData = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));
    const propertyAmenities: any[] = [];

    rawData.properties.forEach((prop: any) => {
        if (prop.badges) {
            prop.badges.forEach((badge: string) => {
                let matchedId = amenityMap.get(badge);
                if (matchedId) {
                    propertyAmenities.push({
                        property_id: prop.property_id,
                        amenity_id: matchedId
                    });
                } else {
                    // Optional: Log missing badges to improve master list
                    // console.log(`Badge not in master: ${badge}`);
                }
            });
        }
    });

    console.log(`Found ${propertyAmenities.length} property-amenity links.`);

    // 3. Insert Links
    if (propertyAmenities.length > 0) {
        const { error: linkError } = await supabase
            .from('property_amenities')
            .upsert(propertyAmenities, { onConflict: 'property_id,amenity_id' });

        if (linkError) console.error('Error linking amenities:', linkError);
        else console.log('Successfully linked amenities!');
    } else {
        console.log('No property amenities to link.');
    }
}

seedAmenities();
