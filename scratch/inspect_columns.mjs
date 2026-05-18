import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function inspectColumns() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    for (const table of ['sessions', 'user_intents', 'shifts']) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (data && data.length > 0) {
            console.log(`Columns for ${table}:`, Object.keys(data[0]));
        } else if (error) {
            console.log(`Error inspecting ${table}:`, error.message);
        } else {
            console.log(`No data in ${table} to inspect columns.`);
        }
    }
}
inspectColumns();
