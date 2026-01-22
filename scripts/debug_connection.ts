
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars manually to avoid path issues
const envPath = path.resolve(process.cwd(), '.env.local');
// We used dotenv previously, let's try a simpler approach if dotenv fails to load or something
dotenv.config({ path: envPath });

const sbUrl = process.env.VITE_SUPABASE_URL;
const sbKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('URL:', sbUrl ? 'Found' : 'Missing');
console.log('Key:', sbKey ? 'Found' : 'Missing');

if (!sbUrl || !sbKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(sbUrl, sbKey);

async function test() {
    console.log('Testing connection to properties...');
    const { data: props, error: propError } = await supabase.from('properties').select('count', { count: 'exact', head: true });

    if (propError) {
        console.error('Properties check failed:', propError.message);
    } else {
        console.log('Properties table exists. Count:', props);
    }

    console.log('Testing connection to amenities_master...');
    const { data: am, error: amError } = await supabase.from('amenities_master').select('count', { count: 'exact', head: true });

    if (amError) {
        console.error('Amenities check failed:', amError.message);
    } else {
        console.log('Amenities table exists. Count:', am);
    }
}

test();
