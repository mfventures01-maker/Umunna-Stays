
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    console.log('Checking leads table...');
    const { count, error } = await supabase.from('leads').select('*', { count: 'exact', head: true });

    if (error) {
        console.log('Leads Read Error:', error.message);
    } else {
        console.log('Leads Table Exists. Count:', count);

        console.log('Attempting insert...');
        // Test payload based on what the form sends
        const payload = {
            created_at: new Date().toISOString(),
            full_name: 'Console Test',
            phone: '1234567890',
            city: 'TestCity',
            service_type: 'TRANSPORT',
            status: 'new',
            details: { note: 'Console test insert' }
        };

        const { data, error: insError } = await supabase.from('leads').insert(payload).select();
        if (insError) {
            console.log('Insert Error:', JSON.stringify(insError));
        } else {
            console.log('Insert Success:', JSON.stringify(data));
        }
    }
}

check();
