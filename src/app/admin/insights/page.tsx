import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Users, LayoutDashboard, Package, MapPin, Eye, Heart, MessageSquare } from "lucide-react";
import { InsightsPanels } from "@/components/admin/InsightsPanels";

export default async function InsightsPage() {
    const supabase = await createClient();

    // Requisito 1: Usuarios por provincia
    let topProvinces: any[] = [];
    const { data: provData, error: provErr } = await supabase.rpc('get_insights_top_provinces');
    if (!provErr && provData) {
        // Fetch province names
        const { data: provNames } = await supabase.from('provinces').select('id, name').in('id', provData.map((p: any) => p.province_id));
        topProvinces = provData.map((p: any) => ({
            ...p,
            name: provNames?.find((n: any) => n.id === p.province_id)?.name || `Provincia ${p.province_id}`
        }));
    }

    // Utilizamos auth.admin.listUsers para obtener los last_sign_in_at
    // Necesitamos el service_role_key para usar el admin api
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
            .slice(0, 5)
            .map(u => ({ id: u.id, email: u.email, last_sign_in_at: u.last_sign_in_at }));
        
        // Obtener nombres de esos usuarios
        if (topConnectedUsers.length > 0) {
            const { data: userProfiles } = await supabase.from('users').select('id, name, email').in('id', topConnectedUsers.map(u => u.id));
            topConnectedUsers = topConnectedUsers.map(u => ({
                ...u,
                name: userProfiles?.find((p: any) => p.id === u.id)?.name || u.email
            }));
        }
    }

    // Requisito 3: Usuarios con más anuncios
    let topUsersListings: any[] = [];
    const { data: ulData, error: ulErr } = await supabase.rpc('get_insights_top_users_listings');
    if (!ulErr && ulData) {
        const { data: userProfiles } = await supabase.from('users').select('id, name, email').in('id', ulData.map((u: any) => u.user_id));
        topUsersListings = ulData.map((u: any) => ({
            ...u,
            name: userProfiles?.find((p: any) => p.id === u.user_id)?.name || userProfiles?.find((p: any) => p.id === u.user_id)?.email || 'Desconocido'
        }));
    }

    // Requisito 4: Usuarios con más chats
    let topUsersChats: any[] = [];
    const { data: ucData, error: ucErr } = await supabase.rpc('get_insights_top_users_chats');
    if (!ucErr && ucData) {
        const { data: userProfiles } = await supabase.from('users').select('id, name, email').in('id', ucData.map((u: any) => u.user_id));
        topUsersChats = ucData.map((u: any) => ({
            ...u,
            name: userProfiles?.find((p: any) => p.id === u.user_id)?.name || userProfiles?.find((p: any) => p.id === u.user_id)?.email || 'Desconocido'
        }));
    }

    // Requisito 5: Anuncios más visitados
    const { data: topVisitedListings, error: visitedErr } = await supabase
        .from('listings')
        .select('id, title, visits_count')
        .order('visits_count', { ascending: false, nullsFirst: false })
        .limit(5);

    // Requisito 6: Anuncios con más likes
    let topLikesListings: any[] = [];
    const { data: llData, error: llErr } = await supabase.rpc('get_insights_top_listings_likes');
    if (!llErr && llData) {
        const { data: listProfiles } = await supabase.from('listings').select('id, title').in('id', llData.map((l: any) => l.listing_id));
        topLikesListings = llData.map((l: any) => ({
            ...l,
            title: listProfiles?.find((p: any) => p.id === l.listing_id)?.title || 'Desconocido'
        }));
    }

    // Requisito 7: Anuncios con más chats
    let topListingsChats: any[] = [];
    const { data: lcData, error: lcErr } = await supabase.rpc('get_insights_top_listings_chats');
    if (!lcErr && lcData) {
        const { data: listProfiles } = await supabase.from('listings').select('id, title').in('id', lcData.map((l: any) => l.listing_id));
        topListingsChats = lcData.map((l: any) => ({
            ...l,
            title: listProfiles?.find((p: any) => p.id === l.listing_id)?.title || 'Desconocido'
        }));
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-[var(--ag-sys-color-border)] pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--ag-sys-color-text)]">Insights & KPIs</h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-1">Análisis premium de usuarios y anuncios.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatCard label="Total Usuarios Top" value={topConnectedUsers.length} icon={<Users />} color="green" />
                <AdminStatCard label="Eventos Favoritos" value={topLikesListings.reduce((acc: number, curr: any) => acc + curr.likes_count, 0)} icon={<Heart />} color="purple" />
                <AdminStatCard label="T. Clicks / Visitas" value={topVisitedListings?.reduce((acc: number, curr: any) => acc + (curr.visits_count || 0), 0) || 0} icon={<Eye />} color="blue" />
            </div>

            <InsightsPanels 
                topProvinces={topProvinces}
                topConnectedUsers={topConnectedUsers}
                topUsersListings={topUsersListings}
                topUsersChats={topUsersChats}
                topVisitedListings={topVisitedListings}
                topLikesListings={topLikesListings}
                topListingsChats={topListingsChats}
            />
        </div>
    );
}
