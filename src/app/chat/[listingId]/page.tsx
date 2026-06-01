import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ChatThread } from "@/components/chat/ChatThread";
import { getServerTenantFilterString } from "@/utils/tenant/server";

export default async function ChatThreadPage(props: {
    params: Promise<{ listingId: string }>;
    searchParams: Promise<{ u?: string }>;
}) {
    const { listingId } = await props.params;
    const { u: otherUserIdParam } = await props.searchParams;
    const supabase = await createClient();

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) redirect("/login");

    // Obtener anuncio (con el cliente autenticado)
    let { data: listing } = await supabase
        .from("listings")
        .select("id, title, image_urls, user_id")
        .eq("id", listingId)
        .or(await getServerTenantFilterString())
        .single();

    // Si no se encuentra (por ejemplo, porque está vendido y el RLS lo oculta a los no propietarios),
    // forzamos la carga con el cliente administrador para dar contexto al chat
    if (!listing) {
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        const adminSupabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!, 
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: adminListing } = await adminSupabase
            .from("listings")
            .select("id, title, image_urls, user_id")
            .eq("id", listingId)
            .or(await getServerTenantFilterString())
            .single();
            
        if (adminListing) {
            listing = adminListing;
        } else {
            notFound();
        }
    }

    // Determinar quién es el "otro" usuario
    const otherUserId = otherUserIdParam || listing.user_id;

    // No puedes chatear contigo mismo (a menos que sea modo preventivo)
    if (otherUserId === currentUser.id && !otherUserIdParam) {
        // Si intentas chatear con tu propio anuncio desde la página de detalle
        redirect("/chat");
    }

    // Obtener datos del otro usuario
    const { data: otherUserData } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .eq("id", otherUserId)
        .single();

    if (!otherUserData) notFound();

    // Obtener mensajes iniciales
    const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("listing_id", listingId)
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUser.id})`)
        .order("created_at", { ascending: true });

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-8 w-full flex flex-col">
            <div className="container mx-auto px-4 w-full max-w-4xl">
                <ChatThread
                    listing={listing}
                    initialMessages={messages || []}
                    currentUser={currentUser}
                    otherUser={otherUserData}
                />
            </div>
        </div>
    );
}
