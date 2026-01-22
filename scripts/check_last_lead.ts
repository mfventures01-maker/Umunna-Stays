
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function checkLastLead() {
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('service_type', 'TRANSPORT')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching leads:', error);
        process.exit(1);
    }

    if (data && data.length > 0) {
        console.log('Last Transport Lead:', JSON.stringify(data[0], null, 2));
    } else {
        console.log('No transport leads found.');
    }
}

checkLastLead();
