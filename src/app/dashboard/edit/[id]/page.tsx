import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import EditListingForm from "@/components/dashboard/EditListingForm";
import { decodeId } from "@/utils/idUtils";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditListingPage(props: Props) {
    const { id: shortId } = await props.params;
    const id = decodeId(shortId);

    if (!id) {
        notFound();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch listing to edit
    const { data: listing, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id) // Ensure the user owns this listing
        .single();

    if (error || !listing) {
        // Either the listing doesn't exist, or it doesn't belong to the user
        notFound();
    }

    // Fetch user profile to get saved phone just in case
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
        <EditListingForm
            listing={listing}
            savedPhone={savedPhone}
            initialProvinces={initialProvinces}
            initialMunicipalities={initialMunicipalities}
            userEmail={user.email}
        />
    );
}
