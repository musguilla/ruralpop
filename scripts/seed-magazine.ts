import { createClient } from "@supabase/supabase-js";
import { MAGAZINE_POSTS } from "../src/content/magazine/posts.ts";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log("Starting DB seeding for Magazine Articles...");

    const postsToInsert = MAGAZINE_POSTS.map(post => ({
        slug: post.id,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        image_url: post.imageUrl,
        content: post.content || "",
        is_published: true,
        // Optional parsing of localized string "16 Ene 2026" to some date
        // Since we don't have a rigid date parsing here for these custom formatted dates,
        // we will leave published_at to the database's default timestamp, 
        // OR we can just insert it as created_at using naive subtraction.
    }));

    // Actually, let's process the posts
    for (const data of postsToInsert) {
        const { error } = await supabase
            .from("magazine_posts")
            .upsert(data, { onConflict: "slug" });

        if (error) {
            console.error(`Error inserting ${data.slug}:`, error.message);
        } else {
            console.log(`✅ Upserted: ${data.slug}`);
        }
    }

    console.log("Seeding complete.");
}

seed().catch(console.error);
