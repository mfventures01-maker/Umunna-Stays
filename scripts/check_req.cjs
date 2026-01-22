
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    console.log('Checking requests...');
    const { count, error } = await supabase.from('requests').select('*', { count: 'exact', head: true });
    if (error) console.log('Requests Error:', error.message);
    else console.log('Requests Table Exists. Count:', count);

    console.log('Checking leads...');
    const { count: lCount, error: lError } = await supabase.from('leads').select('*', { count: 'exact', head: true });
    if (lError) console.log('Leads Error:', lError.message);
    else console.log('Leads Table Exists. Count:', lCount);
}

check();
