const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    const tables = ['properties', 'property_images', 'food_vendors', 'food_items'];
    console.log(`Using URL: ${supabaseUrl}`);

    for (const table of tables) {
        console.log(`Checking table: ${table}...`);
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });

        if (error) {
            console.error(`❌ Error checking ${table}:`, error.message);
        } else {
            console.log(`✅ Table ${table} exists with ${count} records.`);
        }
    }
}

checkTables();
