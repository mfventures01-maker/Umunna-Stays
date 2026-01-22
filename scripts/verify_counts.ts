
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyCounts() {
    const tables = ['properties', 'property_images', 'transport_vehicles', 'transport_services', 'food_items', 'food_vendors'];

    for (const t of tables) {
        const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        if (error) console.error(`Error counting ${t}:`, error.message);
        else console.log(`${t}: ${count}`);
    }
}

verifyCounts();
