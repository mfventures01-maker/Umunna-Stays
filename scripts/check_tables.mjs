
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    const tables = ['properties', 'property_images', 'food_vendors', 'food_items'];
    console.log(`Checking DB at: ${supabaseUrl}`);

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });

        if (error) {
            console.error(`❌ Error checking ${table}:`, error.message);
        } else {
            console.log(`✅ Table ${table} has ${count} records.`);
        }
    }
}

checkTables();
