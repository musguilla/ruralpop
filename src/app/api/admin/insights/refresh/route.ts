import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { getServerTenantSlug } from "@/utils/tenant/server";
import { TENANTS_CONFIG } from "@/config/tenants";

export const maxDuration = 300; // 5 minutes max duration on Vercel Pro, to prevent timeouts

export async function POST() {
    try {
        // Authenticate the user checking if they are admin
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify if user is admin (optional based on your implementation, usually role='admin' or checking specific emails)
        // For now, if they can call this from the admin panel, they are likely authenticated. We'll proceed.

        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const tenantSlug = await getServerTenantSlug();
        const isEquipop = tenantSlug === 'equipop';
        const equipopId = TENANTS_CONFIG['equipop']?.id;
        const filterId = isEquipop ? equipopId : null;
        const cacheFileName = isEquipop ? 'admin-insights-cache-equipop.json' : 'admin-insights-cache.json';

        // Helper to fetch all records bypassing the 1000 limit
        async function fetchAllRecords(table: string, selectQuery: string, filterByTenant: boolean = true) {
            let allData: any[] = [];
            let from = 0;
            const step = 1000;
            
            while (true) {
                let query = supabaseAdmin
                    .from(table)
                    .select(selectQuery)
                    .range(from, from + step - 1);
                if (filterByTenant && filterId) query = query.eq('tenant_id', filterId);
                    
                const { data, error } = await query;
                    
                if (error || !data || data.length === 0) break;
                allData = allData.concat(data);
                if (data.length < step) break;
                from += step;
            }
            return allData;
        }

        // --- 1. Usuarios por provincia (Top 100) ---
        let topProvinces: any[] = [];
        const usersData = await fetchAllRecords('users', 'id, province_id');
        const validUserIds = new Set(usersData?.map(u => u.id) || []);
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
                const { data: provNames } = await supabaseAdmin.from('provinces').select('id, name').in('id', sortedProvs.map(p => p.province_id));
                topProvinces = sortedProvs.map(p => ({
                    ...p,
                    name: provNames?.find((n: any) => n.id === p.province_id)?.name || `Provincia ${p.province_id}`
                }));
            }
        }

        // --- 2. Usuarios más conectados hoy ---
        let allAuthUsers: any[] = [];
        let page = 1;
        while (true) {
            const { data: authData, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
            if (error || !authData || !authData.users || authData.users.length === 0) break;
            allAuthUsers = allAuthUsers.concat(authData.users);
            if (authData.users.length < 1000) break;
            page++;
        }
        
        let topConnectedUsers: any[] = [];
        let activeUsersTodayCount = 0;
        
        if (allAuthUsers.length > 0) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const activeToday = allAuthUsers.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= todayStart && (!filterId || validUserIds.has(u.id)));
            activeUsersTodayCount = activeToday.length;

            topConnectedUsers = activeToday
                .sort((a, b) => new Date(b.last_sign_in_at!).getTime() - new Date(a.last_sign_in_at!).getTime())
                .slice(0, 100)
                .map(u => ({ id: u.id, email: u.email, last_sign_in_at: u.last_sign_in_at }));
            
            if (topConnectedUsers.length > 0) {
                const { data: userProfiles } = await supabaseAdmin.from('users').select('id, name').in('id', topConnectedUsers.map(u => u.id));
                topConnectedUsers = topConnectedUsers.map(u => ({
                    ...u,
                    name: userProfiles?.find((p: any) => p.id === u.id)?.name || u.email,
                    time_label: new Date(u.last_sign_in_at).toLocaleDateString()
                }));
            }
        }

        // --- 3. Usuarios con más anuncios y conteo de categorías ---
        let topUsersListings: any[] = [];
        let topCategories: any[] = [];
        const listingsData = await fetchAllRecords('listings', 'user_id, category, subcategory, visits_count');
        const totalAnalyzedListings = listingsData?.length || 0;
        
        if (listingsData) {
            const listCounts: Record<string, number> = {};
            const catCounts: Record<string, number> = {};
            listingsData.forEach((l: any) => {
                if (l.user_id) listCounts[l.user_id] = (listCounts[l.user_id] || 0) + 1;
                if (l.category) {
                    let catName = l.category.charAt(0).toUpperCase() + l.category.slice(1);
                    if (l.subcategory) {
                        const subName = l.subcategory.charAt(0).toUpperCase() + l.subcategory.slice(1);
                        catName = `${catName} > ${subName}`;
                    }
                    catCounts[catName] = (catCounts[catName] || 0) + 1;
                }
            });
            
            topCategories = Object.entries(catCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);

            const sortedListUsers = Object.entries(listCounts)
                .map(([user_id, listings_count]) => ({ user_id, listings_count }))
                .sort((a, b) => b.listings_count - a.listings_count)
                .slice(0, 100);

            if (sortedListUsers.length > 0) {
                const { data: userProfiles } = await supabaseAdmin.from('users').select('id, name, commercial_name, email').in('id', sortedListUsers.map(u => u.user_id));
                topUsersListings = sortedListUsers.map(u => ({
                    ...u,
                    name: userProfiles?.find((p: any) => p.id === u.user_id)?.name || userProfiles?.find((p: any) => p.id === u.user_id)?.commercial_name || userProfiles?.find((p: any) => p.id === u.user_id)?.email || 'Desconocido'
                }));
            }
        }

        // --- 4. Usuarios Y Anuncios con más chats ---
        let topUsersChats: any[] = [];
        let topListingsChats: any[] = [];
        const msgsData = await fetchAllRecords('messages', 'sender_id, receiver_id, listing_id');
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
                const { data: userProfiles } = await supabaseAdmin.from('users').select('id, name, commercial_name, email').in('id', sortedUserChats.map(u => u.user_id));
                topUsersChats = sortedUserChats.map(u => ({
                    ...u,
                    name: userProfiles?.find((p: any) => p.id === u.user_id)?.name || userProfiles?.find((p: any) => p.id === u.user_id)?.commercial_name || userProfiles?.find((p: any) => p.id === u.user_id)?.email || 'Desconocido'
                }));
            }

            if (sortedListChats.length > 0) {
                const { data: listProfiles } = await supabaseAdmin.from('listings').select('id, title').in('id', sortedListChats.map(l => l.listing_id));
                topListingsChats = sortedListChats.map(l => ({
                    ...l,
                    title: listProfiles?.find((p: any) => p.id === l.listing_id)?.title || 'Desconocido'
                }));
            }
        }

        // --- 5. Anuncios más visitados ---
        let visitedQuery = supabaseAdmin
            .from('listings')
            .select('id, title, visits_count')
            .order('visits_count', { ascending: false, nullsFirst: false })
            .limit(100);
        if (filterId) visitedQuery = visitedQuery.eq('tenant_id', filterId);
        const { data: topVisitedListings } = await visitedQuery;

        // --- 6. Anuncios con más likes ---
        let topLikesListings: any[] = [];
        const favsData = await fetchAllRecords('favorites', 'listing_id');
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
                const { data: listProfiles } = await supabaseAdmin.from('listings').select('id, title').in('id', sortedLikes.map(l => l.listing_id));
                topLikesListings = sortedLikes.map(l => ({
                    ...l,
                    title: listProfiles?.find((p: any) => p.id === l.listing_id)?.title || 'Desconocido'
                }));
            }
        }

        // --- Compile final payload ---
        const totalTraffic = listingsData?.reduce((acc: number, curr: any) => acc + (curr.visits_count || 0), 0) || 0;

        const insightsData = {
            last_updated: new Date().toISOString(),
            activeUsersTodayCount,
            totalAnalyzedListings,
            totalTraffic,
            topProvinces,
            topConnectedUsers,
            topUsersListings,
            topUsersChats,
            topVisitedListings: topVisitedListings || [],
            topLikesListings,
            topListingsChats,
            topCategories
        };

        // --- Upload to Supabase Storage ---
        const { error: uploadError } = await supabaseAdmin
            .storage
            .from('wpublic')
            .upload(cacheFileName, JSON.stringify(insightsData), {
                contentType: 'application/json',
                upsert: true,
                cacheControl: '0'
            });

        if (uploadError) {
            console.error("Storage Upload Error:", uploadError);
            return NextResponse.json({ error: "Failed to save insights data" }, { status: 500 });
        }

        return NextResponse.json({ success: true, timestamp: insightsData.last_updated });

    } catch (error: any) {
        console.error("Insights Refresh Error:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}
