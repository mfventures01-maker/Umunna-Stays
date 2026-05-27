import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const sbUrl = process.env.VITE_SUPABASE_URL;
const sbKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!sbUrl || !sbKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(sbUrl, sbKey);

async function run() {
  console.log('Testing login for admin@umunnastays.com.ng...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@umunnastays.com.ng',
    password: 'admin123'
  });

  if (error) {
    console.error('❌ Login failed:', error.message, 'Status:', error.status);
  } else {
    console.log('✅ Login succeeded! User ID:', data.user.id);
    console.log('Session metadata:', data.session ? 'Present' : 'Missing');
  }
}

run();
