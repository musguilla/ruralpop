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

    // Fetch provinces to feed the first selector
    const { data: provinces } = await supabase
        .from("provinces")
        .select("id, name")
        .order("name");

    const initialProvinces = provinces || [];

    return <UploadForm savedPhone={savedPhone} initialProvinces={initialProvinces} />;
}
