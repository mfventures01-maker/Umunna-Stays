
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProperties() {
    console.log('Checking connection...');
    const { data, error, count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching properties:', error);
    } else {
        console.log(`Found ${count} properties.`);
    }

    // Check schema of properties table by fetching one
    const { data: sample, error: err2 } = await supabase.from('properties').select('*').limit(1);
    if (err2) {
        console.error('Error fetching one property:', err2);
    } else {
        console.log('Sample property:', sample);
    }
}

checkProperties();
