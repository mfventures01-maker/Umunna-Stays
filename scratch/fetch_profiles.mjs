import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const sbUrl = process.env.VITE_SUPABASE_URL;
const sbKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(sbUrl, sbKey);

async function run() {
  console.log('Fetching profiles...');
  const { data, error } = await supabase.from('profiles').select('*');

  if (error) {
    console.error('❌ Fetch profiles failed:', error.message);
  } else {
    console.log('✅ Fetch profiles succeeded! Profiles found:', data.length);
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
