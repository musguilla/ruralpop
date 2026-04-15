import { updateMagazinePost } from "../src/app/admin/marketing/cms/actions";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
    const formData = new FormData();
    formData.append("title", "Test Title");
    formData.append("slug", "vacuna-trivalente-lengua-azul");
    formData.append("category", "Innovación");
    formData.append("excerpt", "Test");
    formData.append("content", "Test");
    formData.append("is_published", "on");
    // Simulate what the form sends
    formData.append("published_at", "2026-03-15 10:23");
    
    // Create an empty file to satisfy image
    const file = new File([""], "test.png", { type: "image/png" });
    formData.append("image", file);
    formData.append("existing_image_url", "https://example.com/test.png");

    try {
        const id = "754bb5ff-de94-4d8e-be89-9a1005ca7ff2"; // We need the actual ID of the post.
        // wait, let's get ID from DB first
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        const {data} = await supabase.from('magazine_posts').select('id').eq('slug', 'vacuna-trivalente-lengua-azul').single();
        
        await updateMagazinePost(data.id, formData);
        console.log("Success");
    } catch(e) {
        console.error("FAIL:", e);
    }
}
run();
