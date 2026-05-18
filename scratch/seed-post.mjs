import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedPost() {
    const post = {
        title: "The Ultimate Asaba Security Protocol",
        slug: "asaba-security-protocol",
        content: "<h2>Security is the Foundation</h2><p>In this guide, we detail how Umunna Stays implements 24/7 armed protection and ghost protocol logistics for our executives.</p>",
        excerpt: "Learn how we engineer silence and safety in the heart of Delta State.",
        category: "Safety Intelligence",
        lifecycle_state: "published",
        status: "published",
        published_at: new Date().toISOString(),
        index_status: "indexed",
        meta_title: "Executive Security in Asaba | Umunna Stays Intelligence",
        meta_description: "A deep dive into the security infrastructure of Umunna Stays apartments in Asaba.",
        focus_keyword: "Asaba Security"
    };

    const { data, error } = await supabase.from('posts').insert([post]).select();
    
    if (error) {
        console.error("Error seeding post:", error);
    } else {
        console.log("✅ Seeded published post:", data[0].slug);
    }
}

seedPost();
