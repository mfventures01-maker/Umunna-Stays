
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    console.log('Checking amenities_master...');
    const { count: masterCount, error: masterError } = await supabase.from('amenities_master').select('*', { count: 'exact', head: true });
    console.log('Master Count:', masterCount);
    if (masterError) console.log('Master Error:', masterError);

    console.log('Checking property_amenities...');
    const { count: linkCount, error: linkError } = await supabase.from('property_amenities').select('*', { count: 'exact', head: true });
    console.log('Link Count:', linkCount);
    if (linkCount === 0) {
        console.log('Link count is 0. Trying to fetch rows to be sure...');
        const { data } = await supabase.from('property_amenities').select('*').limit(5);
        console.log('Rows:', data);
    }
    if (linkError) console.log('Link Error:', linkError);
}

check();
