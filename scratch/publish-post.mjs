import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function publishPost() {
    const { data, error } = await supabase.from('posts')
        .update({ lifecycle_state: 'published', status: 'published' })
        .eq('slug', 'asaba-security-protocol')
        .select();
    
    if (error) {
        console.error("Error publishing post:", error);
    } else {
        console.log("✅ Published post:", data[0].slug, "State:", data[0].lifecycle_state);
    }
}

publishPost();
