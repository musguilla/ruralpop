import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { isAdmin } from "@/utils/auth-check";
import { decodeId } from "@/utils/idUtils";
import AdminEditListingForm from "@/components/admin/AdminEditListingForm";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function AdminEditListingPage(props: Props) {
    if (!await isAdmin()) {
        redirect("/login");
    }

    const { id: shortId } = await props.params;
    const id = decodeId(shortId);

    const supabase = await createClient();

    const { data: listing, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !listing) notFound();

    // Fetch provinces to feed the first selector
    const { data: provinces } = await supabase
        .from("provinces")
        .select("id, name")
        .order("name");

    const initialProvinces = provinces || [];

    // Fetch municipalities if a province is already selected
    let initialMunicipalities: { id: number; name: string }[] = [];
    if (listing.province_id) {
        const { data: muniData } = await supabase
            .from("municipalities")
            .select("id, name")
            .eq("province_id", listing.province_id)
            .order("name");

        initialMunicipalities = muniData || [];
    }

    return (
        <AdminEditListingForm
            listing={listing}
            initialProvinces={initialProvinces}
            initialMunicipalities={initialMunicipalities}
        />
    );
}
