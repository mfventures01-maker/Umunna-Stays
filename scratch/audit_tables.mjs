import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function listTables() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: tables, error } = await supabase.rpc('get_tables_info'); // Assuming this RPC exists or we check another way
    
    // If RPC doesn't exist, try a direct query to pg_catalog via a custom query if possible, 
    // but usually we can just check 'properties', 'leads', etc. 
    // Let's try to query 'information_schema.tables' via a SQL block or just guess common ones.
    
    // Better: let's try to fetch from a few likely ones.
    const tablesToCheck = ['properties', 'leads', 'posts', 'shifts', 'orders', 'transactions', 'sessions', 'user_intents'];
    for (const table of tablesToCheck) {
        const { error: checkError } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (!checkError) {
            console.log(`✅ Table exists: ${table}`);
        } else {
            console.log(`❌ Table missing or no access: ${table}`);
        }
    }
}
listTables();
