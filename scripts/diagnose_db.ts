
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const sbUrl = process.env.VITE_SUPABASE_URL;
const sbKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!sbUrl || !sbKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(sbUrl, sbKey);

async function diagnose() {
    console.log("1. Checking 'leads' table existence...");
    const { count, error: countError } = await supabase.from('leads').select('*', { count: 'exact', head: true });

    if (countError) {
        console.error("Error accessing 'leads':", JSON.stringify(countError, null, 2));
        // If table doesn't exist (404/PGRST301), we know.
    } else {
        console.log(`'leads' table accessible. Row count: ${count}`);
    }

    console.log("2. Checking 'requests' table existence...");
    const { count: reqCount, error: reqError } = await supabase.from('requests').select('*', { count: 'exact', head: true });

    if (reqError) {
        console.error("Error accessing 'requests':", reqError.message);
    } else {
        console.log(`'requests' table accessible. Row count: ${reqCount}`);
    }

    console.log("3. Attempting Test Insert into 'leads'...");
    const testLead = {
        lead_id: 'test_' + Date.now(),
        created_at: new Date().toISOString(),
        service_type: 'TRANSPORT',
        vendor_id: 'TEST_VENDOR',
        city: 'TestCity'
    };

    const { data, error: insertError } = await supabase.from('leads').insert(testLead).select();

    if (insertError) {
        console.error("Insert failed:", JSON.stringify(insertError, null, 2));
    } else {
        console.log("Insert success:", data);
    }
}

diagnose();
