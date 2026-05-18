import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function inspectColumns() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    console.log("Checking 'posts' table...");
    const { data, error } = await supabase.from('posts').select('*').limit(1);
    
    if (data && data.length > 0) {
        console.log(`Columns for posts:`, Object.keys(data[0]));
    } else if (error) {
        console.log(`Error inspecting posts:`, error.message);
        // If posts table doesn't exist, check blog_posts
        console.log("Checking 'blog_posts' table...");
        const { data: bData, error: bError } = await supabase.from('blog_posts').select('*').limit(1);
        if (bData) console.log(`Columns for blog_posts:`, Object.keys(bData[0] || {}));
        else console.log(`Error inspecting blog_posts:`, bError?.message);
    } else {
        console.log(`No data in posts to inspect columns.`);
    }
}
inspectColumns();
