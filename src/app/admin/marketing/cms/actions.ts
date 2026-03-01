"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function uploadImage(file: File | null): Promise<string | null> {
    if (!file || file.size === 0) return null;
    const supabase = await createClient();
    const uuid = crypto.randomUUID();
    const fileExt = file.name.split('.').pop() || "jpg";
    const fileName = `${uuid}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from("cms")
        .upload(fileName, file);

    if (error) {
        console.error("Storage upload error:", error);
        throw new Error("Error al subir la imagen: " + error.message);
    }

    // As 'cms' bucket must be public since it's used for blog images, we just construct publicUrl
    const { data: publicUrlData } = supabase.storage
        .from("cms")
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
}

export async function createMagazinePost(formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const category = formData.get("category") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const is_published = formData.get("is_published") === "on";

    const image = formData.get("image") as File;
    const image_url = await uploadImage(image);

    if (!title || !slug || !category || !image_url || !excerpt) {
        throw new Error("Missing required fields or image could not be uploaded.");
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
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const is_published = formData.get("is_published") === "on";

    const image = formData.get("image") as File;
    let image_url = formData.get("existing_image_url") as string || "";

    if (image && image.size > 0) {
        const uploadedUrl = await uploadImage(image);
        if (uploadedUrl) {
            image_url = uploadedUrl;
        }
    }

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
