"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createMagazinePost(formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const category = formData.get("category") as string;
    const image_url = formData.get("image_url") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const is_published = formData.get("is_published") === "on";

    if (!title || !slug || !category || !image_url || !excerpt) {
        throw new Error("Missing required fields");
    }

    const { error } = await supabase.from("magazine_posts").insert({
        title,
        slug,
        category,
        image_url,
        excerpt,
        content: content || "",
        is_published,
    });

    if (error) {
        console.error("Error creating post:", error);
        throw new Error(error.message);
    }

    revalidatePath("/admin/marketing/cms");
    revalidatePath("/magazine");
    redirect("/admin/marketing/cms");
}

export async function updateMagazinePost(id: string, formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const category = formData.get("category") as string;
    const image_url = formData.get("image_url") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const is_published = formData.get("is_published") === "on";

    if (!title || !slug || !category || !image_url || !excerpt) {
        throw new Error("Missing required fields");
    }

    const { error } = await supabase
        .from("magazine_posts")
        .update({
            title,
            slug,
            category,
            image_url,
            excerpt,
            content: content || "",
            is_published,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating post:", error);
        throw new Error(error.message);
    }

    revalidatePath("/admin/marketing/cms");
    revalidatePath("/magazine");
    revalidatePath(`/magazine/${slug}`);
    redirect("/admin/marketing/cms");
}

export async function deleteMagazinePost(id: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("magazine_posts").delete().eq("id", id);

    if (error) {
        console.error("Error deleting post:", error);
        throw new Error(error.message);
    }

    revalidatePath("/admin/marketing/cms");
    revalidatePath("/magazine");
}
