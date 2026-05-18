
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyRequest() {
    console.log('--- Verifying Request Submission ---');

    const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('full_name', 'Test Migration')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching request:', error);
    } else {
        if (data && data.length > 0) {
            console.log('Success! Found request:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('No request found for "Test Migration".');
        }
    }
}

verifyRequest();
