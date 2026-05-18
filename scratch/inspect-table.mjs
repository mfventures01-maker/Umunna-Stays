import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectTable() {
    const { data, error } = await supabase.from('posts').select('*').limit(1);
    if (error) {
        console.error("Error inspecting table:", error);
    } else {
        console.log("Table columns (sample):", data.length > 0 ? Object.keys(data[0]) : "Empty table");
    }
}

inspectTable();
