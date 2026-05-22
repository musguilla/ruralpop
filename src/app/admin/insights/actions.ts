"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";

export interface UserProfile {
    id: string;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
}

export interface ListingBrief {
    id: string;
    title: string;
    price: number;
    image_urls: string[] | null;
}

export interface ChatThread {
    lastMessage: {
        id: string;
        content: string;
        created_at: string;
        sender_id: string;
    };
    otherUser: UserProfile | null;
    listing: ListingBrief | null;
    listingId: string;
    otherUserId: string;
    messageCount: number;
}

export interface ChatMessage {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    receiver_id: string;
    sender: UserProfile | null;
    receiver: UserProfile | null;
}

/**
 * Helper interno para verificar que el usuario conectado es administrador y
 * devolver un cliente de Supabase Admin (bypasseando RLS).
 * 
 * @returns supabaseAdmin Client
 * @throws Error si no está autenticado o no es administrador
 */
async function verifyAdminAndGetClient() {
    const supabaseSession = await createServerClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: callerProfile } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (callerProfile?.role !== "admin") {
        throw new Error("Forbidden");
    }

    return supabaseAdmin;
}

/**
 * Obtiene todos los hilos de chat de un usuario específico de forma agrupada.
 * Esta consulta usa el cliente administrador para saltarse RLS y permitir auditoría.
 * 
 * Impacto en rendimiento:
 * - Se realiza una consulta inicial por la tabla 'users' (rápida por PK index).
 * - Se realiza una consulta indexada en la tabla 'messages' buscando sender_id o receiver_id.
 * - El agrupamiento se realiza en memoria O(N) para reducir el tráfico de red y consultas SQL concurrentes.
 * 
 * @param targetUserId ID del usuario de quien se quieren inspeccionar los chats
 */
export async function getUserChatsAction(targetUserId: string): Promise<{
    targetUser: UserProfile;
    threads: ChatThread[];
}> {
    const supabaseAdmin = await verifyAdminAndGetClient();

    // 1. Obtener perfil del usuario objetivo
    const { data: targetUser, error: targetUserError } = await supabaseAdmin
        .from("users")
        .select("id, name, email, avatar_url")
        .eq("id", targetUserId)
        .single();

    if (targetUserError || !targetUser) {
        throw new Error("Target user not found");
    }

    // 2. Obtener mensajes relacionados con el usuario
    const { data: messages, error: messagesError } = await supabaseAdmin
        .from("messages")
        .select(`
            id,
            content,
            created_at,
            listing_id,
            sender_id,
            receiver_id,
            is_read,
            listing:listings(id, title, price, image_urls),
            sender:users!messages_sender_id_fkey(id, name, email, avatar_url),
            receiver:users!messages_receiver_id_fkey(id, name, email, avatar_url)
        `)
        .or(`sender_id.eq.${targetUserId},receiver_id.eq.${targetUserId}`)
        .order("created_at", { ascending: false });

    if (messagesError) {
        console.error("Error fetching target user messages:", messagesError);
        return { targetUser, threads: [] };
    }

    // 3. Agrupamiento de mensajes en hilos de chat únicos
    const threadsMap = new Map<string, ChatThread>();

    messages?.forEach((msg: any) => {
        const otherUserId = msg.sender_id === targetUserId ? msg.receiver_id : msg.sender_id;
        const threadKey = `${msg.listing_id}-${otherUserId}`;

        if (!threadsMap.has(threadKey)) {
            const rawOtherUser = msg.sender_id === targetUserId ? msg.receiver : msg.sender;
            const otherUser: UserProfile | null = rawOtherUser ? {
                id: rawOtherUser.id,
                name: rawOtherUser.name,
                email: rawOtherUser.email,
                avatar_url: rawOtherUser.avatar_url
            } : null;

            const rawListing = msg.listing;
            const listing: ListingBrief | null = rawListing ? {
                id: rawListing.id,
                title: rawListing.title,
                price: Number(rawListing.price) || 0,
                image_urls: rawListing.image_urls
            } : null;

            threadsMap.set(threadKey, {
                lastMessage: {
                    id: msg.id,
                    content: msg.content,
                    created_at: msg.created_at,
                    sender_id: msg.sender_id
                },
                otherUser,
                listing,
                listingId: msg.listing_id,
                otherUserId,
                messageCount: 1
            });
        } else {
            const existing = threadsMap.get(threadKey)!;
            existing.messageCount += 1;
        }
    });

    return {
        targetUser,
        threads: Array.from(threadsMap.values())
    };
}

/**
 * Obtiene el historial completo de mensajes entre dos usuarios sobre un anuncio específico.
 * 
 * Impacto en rendimiento:
 * - Filtra por listing_id (clave foránea con índice) y por parejas de remitentes y destinatarios.
 * - Recuperación ordenada O(M log M) en base de datos.
 * 
 * @param targetUserId ID del usuario analizado
 * @param otherUserId ID del otro participante de la conversación
 * @param listingId ID del anuncio asociado
 */
export async function getChatMessagesAction(
    targetUserId: string,
    otherUserId: string,
    listingId: string
): Promise<{
    messages: ChatMessage[];
    listing: ListingBrief | null;
}> {
    const supabaseAdmin = await verifyAdminAndGetClient();

    // 1. Obtener mensajes en orden cronológico ascendente
    const { data: messagesData, error: messagesError } = await supabaseAdmin
        .from("messages")
        .select(`
            id,
            content,
            created_at,
            sender_id,
            receiver_id,
            sender:users!messages_sender_id_fkey(id, name, email, avatar_url),
            receiver:users!messages_receiver_id_fkey(id, name, email, avatar_url)
        `)
        .eq("listing_id", listingId)
        .in("sender_id", [targetUserId, otherUserId])
        .in("receiver_id", [targetUserId, otherUserId])
        .order("created_at", { ascending: true });

    if (messagesError) {
        console.error("Error fetching chat messages:", messagesError);
        throw new Error("Failed to fetch messages");
    }

    // 2. Obtener datos rápidos del anuncio
    const { data: listingData } = await supabaseAdmin
        .from("listings")
        .select("id, title, price, image_urls")
        .eq("id", listingId)
        .single();

    const listing: ListingBrief | null = listingData ? {
        id: listingData.id,
        title: listingData.title,
        price: Number(listingData.price) || 0,
        image_urls: listingData.image_urls
    } : null;

    const messages: ChatMessage[] = (messagesData || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        sender: msg.sender ? {
            id: msg.sender.id,
            name: msg.sender.name,
            email: msg.sender.email,
            avatar_url: msg.sender.avatar_url
        } : null,
        receiver: msg.receiver ? {
            id: msg.receiver.id,
            name: msg.receiver.name,
            email: msg.receiver.email,
            avatar_url: msg.receiver.avatar_url
        } : null
    }));

    return {
        messages,
        listing
    };
}

/**
 * Memory / Decisiones Técnicas:
 * - Uso exclusivo de supabaseAdmin a través de service_role para evitar las políticas RLS.
 * - Validación estricta de autorización para mitigar cualquier riesgo de fuga de datos de chat privados.
 * - Tipado completo en TypeScript para cumplir con las directrices de robustez y Type Safety del proyecto.
 * - Casos borde cubiertos:
 *   - Mensajes nulos o sin registros devuelve un listado vacío de manera segura.
 *   - Falta de anuncio (anuncio eliminado de la BD) maneja la propiedad `listing` como `null` en lugar de fallar la consulta.
 */
