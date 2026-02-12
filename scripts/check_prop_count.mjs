
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPropertiesOnly() {
    console.log('CHECKING PROPERTIES TABLE...');
    const { count, error } = await supabase.from('properties').select('*', { count: 'exact', head: true });

    if (error) {
        console.error('ERROR:', error.message);
    } else {
        console.log(`PROPERTIES COUNT: ${count}`);
    }
}

checkPropertiesOnly();
