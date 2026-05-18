import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function inspect() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: amenities } = await supabase
        .from('property_amenities')
        .select('property_id, amenity:amenities_master(*)')
        .limit(10);
    console.log(JSON.stringify(amenities, null, 2));
}
inspect();
