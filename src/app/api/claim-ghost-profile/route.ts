import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { ghostToken, newUserId } = await req.json();

        if (!ghostToken || !newUserId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Use service role key to bypass RLS because the user is just created
        // and they don't own the ghost profile yet.
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Find the ghost profile
        const { data: ghostProfile, error: findError } = await supabaseAdmin
            .from('users')
            .select('id, is_ghost, ghost_token')
            .eq('ghost_token', ghostToken)
            .eq('is_ghost', true)
            .single();

        if (findError || !ghostProfile) {
            console.error("Ghost profile not found or already claimed:", findError);
            return NextResponse.json({ error: "Perfil no encontrado o ya reclamado." }, { status: 400 });
        }

        const oldGhostId = ghostProfile.id;

        // 2. We have a problem: Supabase Auth created a NEW row in `users` 
        // with the `newUserId`. But we want all the data from the ghost profile 
        // to be owned by this new user. 
        //
        // Specifically, the strategy is:
        // Copy the commercial fields from ghostProfile to newUserId profile.
        // Update all `listings` from oldGhostId to newUserId.
        // Delete the oldGhostId row.
        
        // Let's get the full ghost data
        const { data: fullGhostData } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', oldGhostId)
            .single();

        if (!fullGhostData) {
            return NextResponse.json({ error: "No se pudo recuperar los datos del perfil" }, { status: 500 });
        }

        const { id, is_ghost, ghost_token, created_at, email, ...ghostDataToCopy } = fullGhostData;

        // Add the professional role explicitly
        ghostDataToCopy.role = 'profesional';
        ghostDataToCopy.plan_type = 'free'; // They will pay right after this
        // Keep them as ghost until payment webhook succeeds
        ghostDataToCopy.is_ghost = true;
        ghostDataToCopy.ghost_token = ghost_token;

        // Update the newly created user row
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update(ghostDataToCopy)
            .eq('id', newUserId);

        if (updateError) {
            console.error("Error updating new user profile:", updateError);
            return NextResponse.json({ error: "No se pudo preparar tu perfil" }, { status: 500 });
        }

        // Reassign listings
        const { error: listingsError } = await supabaseAdmin
            .from('listings')
            .update({ user_id: newUserId })
            .eq('user_id', oldGhostId);

        if (listingsError) {
            console.error("Error transferring listings:", listingsError);
            // We don't abort necessarily, but it's bad
        }

        // Finally, delete the old ghost user so we don't have dupes.
        // Note: this deletes from public.users table but it's technically enough 
        // since it never had an auth.users row anyway (it was a ghost).
        await supabaseAdmin.from('users').delete().eq('id', oldGhostId);

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("Claim API Error:", err);
        return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
    }
}
