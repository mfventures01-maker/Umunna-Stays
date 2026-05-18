
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log('--- Testing Anon Insert ---');

    const { data, error } = await supabase
        .from('requests')
        .insert([
            {
                full_name: 'Script Tester',
                phone: '1234567890',
                request_type: 'STAY',
                city: 'Asaba',
                date_start: '2026-01-01',
                guests_or_passengers: 1,
                budget: 'Standard',
                source_page: 'test_script'
            }
        ])
        .select();

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Insert Success:', JSON.stringify(data, null, 2));
    }
}

testInsert();
