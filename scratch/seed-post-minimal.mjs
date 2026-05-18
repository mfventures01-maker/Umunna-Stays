import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedPostMinimal() {
    const post = {
        title: "The Ultimate Asaba Security Protocol",
        slug: "asaba-security-protocol",
        content: "<h2>Security is the Foundation</h2><p>Safe stays guaranteed.</p>",
        excerpt: "Learn how we engineer safety.",
        status: "published"
    };

    const { data, error } = await supabase.from('posts').insert([post]).select();
    
    if (error) {
        console.error("Error seeding post:", error);
    } else {
        console.log("✅ Seeded minimal post:", data[0].slug);
    }
}

seedPostMinimal();
