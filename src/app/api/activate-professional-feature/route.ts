import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const { listingId, type } = await req.json();

        if (!listingId || !type) {
            return new NextResponse("Missing parameters", { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get user professional data
        const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("role, available_bumps, available_featured")
            .eq("id", user.id)
            .single();

        if (profileError || profile?.role !== 'profesional') {
            return new NextResponse("Solo para cuentas profesionales", { status: 403 });
        }

        // Verify ownership
        const { data: listing, error: listingError } = await supabase
            .from("listings")
            .select("id, user_id")
            .eq("id", listingId)
            .single();

        if (listingError || listing?.user_id !== user.id) {
            return new NextResponse("No tienes permiso o el anuncio no existe", { status: 403 });
        }

        if (type === 'highlight') {
            if ((profile.available_featured || 0) <= 0) {
                return new NextResponse("No tienes destacados disponibles", { status: 400 });
            }

            // Update listing as featured for 20 days
            const featuredUntil = new Date();
            featuredUntil.setDate(featuredUntil.getDate() + 20);

            const { error: updateListingError } = await supabase
                .from("listings")
                .update({ 
                    is_featured: true, 
                    featured_until: featuredUntil.toISOString() 
                })
                .eq("id", listingId);

            if (updateListingError) {
                console.error("Error updating listing:", updateListingError);
                return new NextResponse("Error al destacar el anuncio", { status: 500 });
            }

            // Decrement counter
            await supabase
                .from("users")
                .update({ available_featured: profile.available_featured - 1 })
                .eq("id", user.id);

            return NextResponse.json({ success: true, message: "Anuncio destacado con éxito" });

        } else if (type === 'bump') {
            if ((profile.available_bumps || 0) <= 0) {
                return new NextResponse("No tienes impulsos disponibles", { status: 400 });
            }

            // Update listing created_at to now (bump to top)
            const { error: updateListingError } = await supabase
                .from("listings")
                .update({ created_at: new Date().toISOString() })
                .eq("id", listingId);

            if (updateListingError) {
                console.error("Error bumping listing:", updateListingError);
                return new NextResponse("Error al subir el anuncio", { status: 500 });
            }

            // Decrement counter
            await supabase
                .from("users")
                .update({ available_bumps: profile.available_bumps - 1 })
                .eq("id", user.id);

            return NextResponse.json({ success: true, message: "Anuncio subido a primera posición" });
        }

        return new NextResponse("Tipo de acción no válido", { status: 400 });

    } catch (error) {
        console.error("Error in activate-professional-feature:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
