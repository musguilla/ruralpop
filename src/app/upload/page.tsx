import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import UploadForm from "./UploadForm";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user profile to get saved phone
    const { data: profile } = await supabase
        .from("users")
        .select("phone")
        .eq("id", user.id)
        .single();

    const savedPhone = profile?.phone ?? null;

    return <UploadForm savedPhone={savedPhone} />;
}
