import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPosts() {
    const { data, error } = await supabase.from('posts').select('id, title, lifecycle_state, slug');
    if (error) {
        console.error("Error fetching posts:", error);
        return;
    }
    console.log("Current Posts in Database:");
    console.table(data);
}

checkPosts();
