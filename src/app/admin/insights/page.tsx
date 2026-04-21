import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Users, LayoutDashboard, Package, MapPin, Eye, Heart, MessageSquare } from "lucide-react";
import { InsightsPanels } from "@/components/admin/InsightsPanels";

export default async function InsightsPage() {
    const supabase = await createClient();

    // 1. Usuarios por provincia (Top 100)
    let topProvinces: any[] = [];
    const { data: usersData } = await supabase.from('users').select('province_id');
    if (usersData) {
        const provCounts: Record<number, number> = {};
        usersData.forEach((u: any) => {
            if (u.province_id) provCounts[u.province_id] = (provCounts[u.province_id] || 0) + 1;
        });
        const sortedProvs = Object.entries(provCounts)
            .map(([id, users_count]) => ({ province_id: Number(id), users_count }))
            .sort((a, b) => b.users_count - a.users_count)
            .slice(0, 100);
        
        if (sortedProvs.length > 0) {
            const { data: provNames } = await supabase.from('provinces').select('id, name').in('id', sortedProvs.map(p => p.province_id));
            topProvinces = sortedProvs.map(p => ({
                ...p,
                name: provNames?.find((n: any) => n.id === p.province_id)?.name || `Provincia ${p.province_id}`
            }));
        }
    }

    // 2. Usuarios más conectados hoy
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: usersAuthData } = await supabaseAdmin.auth.admin.listUsers();
    let topConnectedUsers: any[] = [];
    if (usersAuthData?.users) {
        topConnectedUsers = [...usersAuthData.users]
            .filter(u => u.last_sign_in_at)
            .sort((a, b) => new Date(b.last_sign_in_at!).getTime() - new Date(a.last_sign_in_at!).getTime())
            .slice(0, 100)
            .map(u => ({ id: u.id, email: u.email, last_sign_in_at: u.last_sign_in_at }));
        
        if (topConnectedUsers.length > 0) {
            const { data: userProfiles } = await supabase.from('users').select('id, name').in('id', topConnectedUsers.map(u => u.id));
            topConnectedUsers = topConnectedUsers.map(u => ({
                ...u,
                name: userProfiles?.find((p: any) => p.id === u.id)?.name || u.email,
                time_label: new Date(u.last_sign_in_at).toLocaleDateString()
            }));
        }
    }

    // 3. Usuarios con más anuncios y conteo de categorías
    let topUsersListings: any[] = [];
    let topCategories: any[] = [];
    const { data: listingsData } = await supabase.from('listings').select('user_id, category');
    if (listingsData) {
        const listCounts: Record<string, number> = {};
        const catCounts: Record<string, number> = {};
        listingsData.forEach((l: any) => {
            if (l.user_id) listCounts[l.user_id] = (listCounts[l.user_id] || 0) + 1;
            if (l.category) catCounts[l.category] = (catCounts[l.category] || 0) + 1;
        });
        
        topCategories = Object.entries(catCounts)
            .map(([name, count]) => ({ 
                name: name.charAt(0).toUpperCase() + name.slice(1), 
                count 
            }))
            .sort((a, b) => b.count - a.count);

        const sortedListUsers = Object.entries(listCounts)
            .map(([user_id, listings_count]) => ({ user_id, listings_count }))
            .sort((a, b) => b.listings_count - a.listings_count)
            .slice(0, 100);

        if (sortedListUsers.length > 0) {
            const { data: userProfiles } = await supabase.from('users').select('id, name, email').in('id', sortedListUsers.map(u => u.user_id));
            topUsersListings = sortedListUsers.map(u => ({
                ...u,
                name: userProfiles?.find((p: any) => p.id === u.user_id)?.name || userProfiles?.find((p: any) => p.id === u.user_id)?.email || 'Desconocido'
            }));
        }
    }

    // 4. Usuarios Y Anuncios con más chats (Aprovechamos un solo fetch)
    let topUsersChats: any[] = [];
    let topListingsChats: any[] = [];
    const { data: msgsData } = await supabase.from('messages').select('sender_id, receiver_id, listing_id');
    if (msgsData) {
        const userChatsCounts: Record<string, number> = {};
        const listChatsCounts: Record<string, number> = {};
        
        msgsData.forEach((m: any) => {
            if (m.sender_id) userChatsCounts[m.sender_id] = (userChatsCounts[m.sender_id] || 0) + 1;
            if (m.receiver_id) userChatsCounts[m.receiver_id] = (userChatsCounts[m.receiver_id] || 0) + 1;
            if (m.listing_id) listChatsCounts[m.listing_id] = (listChatsCounts[m.listing_id] || 0) + 1;
        });

        const sortedUserChats = Object.entries(userChatsCounts).map(([user_id, chats_count]) => ({ user_id, chats_count })).sort((a, b) => b.chats_count - a.chats_count).slice(0, 100);
        const sortedListChats = Object.entries(listChatsCounts).map(([listing_id, chats_count]) => ({ listing_id, chats_count })).sort((a, b) => b.chats_count - a.chats_count).slice(0, 100);

        if (sortedUserChats.length > 0) {
            const { data: userProfiles } = await supabase.from('users').select('id, name, email').in('id', sortedUserChats.map(u => u.user_id));
            topUsersChats = sortedUserChats.map(u => ({
                ...u,
                name: userProfiles?.find((p: any) => p.id === u.user_id)?.name || userProfiles?.find((p: any) => p.id === u.user_id)?.email || 'Desconocido'
            }));
        }

        if (sortedListChats.length > 0) {
            const { data: listProfiles } = await supabase.from('listings').select('id, title').in('id', sortedListChats.map(l => l.listing_id));
            topListingsChats = sortedListChats.map(l => ({
                ...l,
                title: listProfiles?.find((p: any) => p.id === l.listing_id)?.title || 'Desconocido'
            }));
        }
    }

    // 5. Anuncios más visitados
    const { data: topVisitedListings } = await supabase
        .from('listings')
        .select('id, title, visits_count')
        .order('visits_count', { ascending: false, nullsFirst: false })
        .limit(100);

    // 6. Anuncios con más likes
    let topLikesListings: any[] = [];
    const { data: favsData } = await supabase.from('favorites').select('listing_id');
    if (favsData) {
        const likeCounts: Record<string, number> = {};
        favsData.forEach((f: any) => {
            if (f.listing_id) likeCounts[f.listing_id] = (likeCounts[f.listing_id] || 0) + 1;
        });
        const sortedLikes = Object.entries(likeCounts)
            .map(([listing_id, likes_count]) => ({ listing_id, likes_count }))
            .sort((a, b) => b.likes_count - a.likes_count)
            .slice(0, 100);

        if (sortedLikes.length > 0) {
            const { data: listProfiles } = await supabase.from('listings').select('id, title').in('id', sortedLikes.map(l => l.listing_id));
            topLikesListings = sortedLikes.map(l => ({
                ...l,
                title: listProfiles?.find((p: any) => p.id === l.listing_id)?.title || 'Desconocido'
            }));
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-[var(--ag-sys-color-border)] pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--ag-sys-color-text)]">Insights & KPIs</h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-1">Análisis premium de usuarios y anuncios.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AdminStatCard label="Usuarios Activos Hoy" value={topConnectedUsers.length} icon={<Users />} color="green" />
                <AdminStatCard label="Anuncios Analizados" value={listingsData?.length || 0} icon={<Package />} color="purple" />
                <AdminStatCard label="Tráfico Acumulado" value={topVisitedListings?.reduce((acc: number, curr: any) => acc + (curr.visits_count || 0), 0) || 0} icon={<Eye />} color="blue" />
            </div>

            <InsightsPanels 
                topProvinces={topProvinces}
                topConnectedUsers={topConnectedUsers}
                topUsersListings={topUsersListings}
                topUsersChats={topUsersChats}
                topVisitedListings={topVisitedListings}
                topLikesListings={topLikesListings}
                topListingsChats={topListingsChats}
                topCategories={topCategories}
            />
        </div>
    );
}
