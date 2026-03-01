import React from "react";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: "Ruralpop Magazine | La conexión rural",
    description: "Noticias, guías legales, historias y toda la actualidad del mundo rural, agricultura y ganadería.",
};

import { MagazineClient } from "./MagazineClient";
import { createClient } from "@/utils/supabase/server";

export default async function MagazinePage() {
    const supabase = await createClient();
    const { data: posts } = await supabase
        .from("magazine_posts")
        .select(`id, slug, title, excerpt, category, image_url, published_at, content`)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

    // Map `slug` to `id` and format date to maintain compatibility with MagazineClient props
    const formattedPosts = (posts || []).map((post: any) => ({
        id: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        imageUrl: post.image_url,
        date: new Intl.DateTimeFormat('es-ES', {
            day: 'numeric', month: 'short', year: 'numeric'
        }).format(new Date(post.published_at)),
        content: post.content
    }));

    return <MagazineClient posts={formattedPosts} />;
}
