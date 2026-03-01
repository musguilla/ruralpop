"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

async function uploadImage(file: File | null): Promise<string | null> {
    if (!file || file.size === 0) return null;

    // We use the Service Role key to bypass RLS since the bucket was created manually by the user
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createSupabaseAdmin(supabaseUrl, supabaseKey);

    const uuid = crypto.randomUUID();
    const fileExt = file.name.split('.').pop() || "jpg";
    const fileName = `${uuid}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
        .from("cms")
        .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true
        });

    if (error) {
        console.error("Storage upload error:", error);
        throw new Error("Error de permisos. ¿El bucket 'cms' existe en tu Supabase?: " + error.message);
    }

    // As 'cms' bucket must be public since it's used for blog images, we just construct publicUrl
    const { data: publicUrlData } = supabaseAdmin.storage
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
