
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function spotCheck() {
    console.log('--- Spot Check: UMUNNA_001 ---');

    // Fetch Property
    const { data: prop, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('property_id', 'UMUNNA_001')
        .single();

    if (propError) console.error('Property Error:', propError);
    else console.log('Property:', JSON.stringify(prop, null, 2));

    // Fetch Images for Property
    const { data: images, error: imgError } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', 'UMUNNA_001')
        .order('sequence_order');

    if (imgError) console.error('Images Error:', imgError);
    else {
        console.log(`Found ${images.length} images.`);
        if (images.length > 0) console.log('First Image:', JSON.stringify(images[0], null, 2));
    }

    // Check Requests (Just checking if table exists/is accessible)
    const { count, error: reqError } = await supabase.from('requests').select('*', { count: 'exact', head: true });
    if (reqError) console.error('Requests Table Error (might be empty or RLS):', reqError.message);
    else console.log('Current Requests Count:', count);
}

spotCheck();
