import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function indexPost() {
    const { data, error } = await supabase.from('posts')
        .update({ index_status: 'indexed' })
        .eq('slug', 'asaba-security-protocol')
        .select();
    
    if (error) {
        console.error("Error indexing post:", error);
    } else {
        console.log("✅ Post Indexed:", data[0].slug, "Status:", data[0].index_status);
    }
}

indexPost();
