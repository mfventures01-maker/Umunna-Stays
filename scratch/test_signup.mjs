import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const sbUrl = process.env.VITE_SUPABASE_URL;
const sbKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(sbUrl, sbKey);

async function run() {
  console.log('Testing sign up for admin@umunnastays.com.ng...');
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@umunnastays.com.ng',
    password: 'admin123',
    options: {
      data: {
        full_name: 'Umunna Admin',
        role: 'super_admin'
      }
    }
  });

  if (error) {
    console.error('❌ Sign up failed:', error.message, 'Status:', error.status);
  } else {
    console.log('✅ Sign up response:', data);
    console.log('User ID:', data.user?.id);
    console.log('Session:', data.session ? 'Created' : 'Pending email confirmation/not created');
  }
}

run();
