import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function audit() {
    const tables = ['properties', 'leads', 'posts', 'shifts', 'orders', 'transactions', 'sessions', 'user_intents'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`❌ Error ${table}: ${error.message}`);
        } else {
            console.log(`✅ Table ${table}:`, data.length > 0 ? Object.keys(data[0]) : "(Empty but exists)");
        }
    }
}

audit();
