import { MagazineForm } from "@/components/admin/MagazineForm";
import { updateMagazinePost } from "../actions";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    return {
        title: "Editar Artículo | Admin Ruralpop"
    };
}

export default async function EditMagazinePostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Server fetch
    const supabase = await createClient();
    const { data: post, error } = await supabase
        .from("magazine_posts")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !post) {
        notFound();
    }

    return (
        <MagazineForm
            initialData={post}
            actionPromise={async (formData) => {
                "use server";
                await updateMagazinePost(id, formData);
            }}
        />
    );
}

// Memory Documentation:
// M1: Awaited params since Next.js 15+ breaks async params without awaits.
// M2: RLS bypassing logic ensures that we don't return null if proper permissions apply to Admin UI.
