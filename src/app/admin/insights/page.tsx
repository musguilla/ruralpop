import { createClient } from "@/utils/supabase/server";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Users, LayoutDashboard, Package, MapPin, Eye, Heart, MessageSquare } from "lucide-react";

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

    // Requisito 2: Usuarios que más se conectan
    // Utilizamos auth.admin.listUsers para obtener los last_sign_in_at
    const { data: usersAuthData } = await supabase.auth.admin.listUsers();
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

    const showWarning = provErr || ulErr || ucErr || llErr || lcErr || visitedErr;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-[var(--ag-sys-color-border)] pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--ag-sys-color-text)]">Insights & KPIs</h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-1">Análisis premium de usuarios y anuncios.</p>
                </div>
            </div>

            {showWarning && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-4 text-orange-800">
                    <span className="font-bold uppercase tracking-wider text-xs">Aviso</span>
                    <p className="text-sm">Por favor, asegúrate de haber ejecutado las migraciones SQL en <code>supabase/migrations/add_insights_fields.sql</code> para habilitar todos los KPIs correctamente.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatCard label="Total Usuarios Top" value={topConnectedUsers.length} icon={<Users />} color="green" />
                <AdminStatCard label="Eventos Favoritos" value={topLikesListings.reduce((acc: number, curr: any) => acc + curr.likes_count, 0)} icon={<Heart />} color="purple" />
                <AdminStatCard label="T. Clicks / Visitas" value={topVisitedListings?.reduce((acc: number, curr: any) => acc + (curr.visits_count || 0), 0) || 0} icon={<Eye />} color="blue" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Panel Usuarios */}
                <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)]">
                            <Users className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)]">Insights Usuarios</h2>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider mb-3">Provincia con más Usuarios</h3>
                            <div className="space-y-2">
                                {topProvinces.map((prov: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-[var(--ag-sys-color-text-muted)]" />
                                            <span className="font-medium text-[var(--ag-sys-color-text)]">{prov.name}</span>
                                        </div>
                                        <span className="font-bold text-[var(--ag-sys-color-primary)]">{prov.users_count} usr</span>
                                    </div>
                                ))}
                                {topProvinces.length === 0 && <p className="text-xs text-gray-500">Cargando o sin datos...</p>}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider mb-3">Usuarios más conectados</h3>
                            <div className="space-y-2">
                                {topConnectedUsers.map((usr: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3">
                                        <span className="font-medium text-[var(--ag-sys-color-text)] truncate">{usr.name}</span>
                                        <span className="text-xs text-[var(--ag-sys-color-text-muted)]">
                                            {usr.last_sign_in_at ? new Date(usr.last_sign_in_at).toLocaleDateString() : 'Desconocido'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider mb-3">Con más anuncios publicados</h3>
                            <div className="space-y-2">
                                {topUsersListings.map((usr: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3">
                                        <span className="font-medium text-[var(--ag-sys-color-text)] truncate">{usr.name}</span>
                                        <span className="font-bold text-[var(--ag-sys-color-primary)]">{usr.listings_count} anuncios</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider mb-3">Con más chats</h3>
                            <div className="space-y-2">
                                {topUsersChats.map((usr: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3">
                                        <span className="font-medium text-[var(--ag-sys-color-text)] truncate">{usr.name}</span>
                                        <span className="font-bold text-[var(--ag-sys-color-primary)]">{usr.chats_count} chats</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Panel Anuncios */}
                <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)]">
                            <Package className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)]">Insights Anuncios</h2>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider mb-3">Más visitados</h3>
                            <div className="space-y-2">
                                {topVisitedListings?.map((lst: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3">
                                        <span className="font-medium text-[var(--ag-sys-color-text)] truncate">{lst.title}</span>
                                        <span className="font-bold text-[var(--ag-sys-color-primary)]">{lst.visits_count || 0} views</span>
                                    </div>
                                ))}
                                {(!topVisitedListings || topVisitedListings.length === 0) && <p className="text-xs text-gray-500">Sin datos de visitas...</p>}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider mb-3">Con más likes</h3>
                            <div className="space-y-2">
                                {topLikesListings.map((lst: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3">
                                        <span className="font-medium text-[var(--ag-sys-color-text)] truncate">{lst.title}</span>
                                        <span className="font-bold text-red-500 flex items-center gap-1"><Heart className="w-4 h-4 fill-current"/> {lst.likes_count}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider mb-3">Con más interacciones (chats)</h3>
                            <div className="space-y-2">
                                {topListingsChats.map((lst: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3">
                                        <span className="font-medium text-[var(--ag-sys-color-text)] truncate">{lst.title}</span>
                                        <span className="font-bold text-blue-500 flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {lst.chats_count}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
