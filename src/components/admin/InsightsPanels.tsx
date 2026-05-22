"use client";

import React, { useState } from "react";
import { Users, Package, MapPin, Heart, MessageSquare, ArrowLeft, BarChart2 } from "lucide-react";
import Link from "next/link";
import { UserChatsExplorer } from "./UserChatsExplorer";

type ProvinceInsight = {
    province_id: number;
    name: string;
    users_count: number;
};

type ConnectedUserInsight = {
    id: string;
    email: string;
    last_sign_in_at: string;
    name: string;
    time_label: string;
};

type UserListingsInsight = {
    user_id: string;
    listings_count: number;
    name: string;
};

type UserChatsInsight = {
    user_id: string;
    chats_count: number;
    name: string;
};

type VisitedListingInsight = {
    id: string;
    title: string;
    visits_count: number;
};

type LikesListingInsight = {
    listing_id: string;
    likes_count: number;
    title: string;
};

type ListingsChatsInsight = {
    listing_id: string;
    chats_count: number;
    title: string;
};

type CategoryInsight = {
    name: string;
    count: number;
};

interface InsightsPanelsProps {
    topProvinces: ProvinceInsight[];
    topConnectedUsers: ConnectedUserInsight[];
    topUsersListings: UserListingsInsight[];
    topUsersChats: UserChatsInsight[];
    topVisitedListings: VisitedListingInsight[];
    topLikesListings: LikesListingInsight[];
    topListingsChats: ListingsChatsInsight[];
    topCategories: CategoryInsight[];
}

type DetailItem = Record<string, string | number | boolean | null | undefined | React.ReactNode | string[]>;

type DetailData = {
    title: string;
    items: DetailItem[];
    labelKey: string;
    valueKey: string;
    icon: React.ReactNode;
    colorClass: string;
    isLink?: boolean;
    isChatUser?: boolean;
};

export function InsightsPanels({
    topProvinces,
    topConnectedUsers,
    topUsersListings,
    topUsersChats,
    topVisitedListings,
    topLikesListings,
    topListingsChats,
    topCategories
}: InsightsPanelsProps) {
    const [detailView, setDetailView] = useState<DetailData | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);

    const openDetail = (
        title: string,
        items: DetailItem[],
        labelKey: string,
        valueKey: string,
        icon: React.ReactNode,
        colorClass: string,
        isLink: boolean = false,
        isChatUser: boolean = false
    ) => {
        setDetailView({ title, items, labelKey, valueKey, icon, colorClass, isLink, isChatUser });
        setHoveredIndex(null);
        window.scrollTo({ top: 100, behavior: 'smooth' });
    };

    if (detailView) {
        const maxVal = Math.max(...detailView.items.map(i => Number(i[detailView.valueKey]) || 0));
        const hoveredData = hoveredIndex !== null ? detailView.items[hoveredIndex] : null;

        return (
            <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-6 shadow-sm animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 mb-2">
                    <button 
                        onClick={() => setDetailView(null)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 flex items-center justify-center bg-gray-50 border border-gray-200 shrink-0"
                        title="Volver"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <BarChart2 className="w-6 h-6 text-gray-500" />
                            {detailView.title}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">Top {detailView.items.length} resultados - Gráfico vertical</p>
                    </div>
                </div>

                {detailView.items.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">No hay datos disponibles</div>
                ) : (
                    <>
                        {/* Dynamic Tooltip Display Area */}
                        <div className="h-10 mb-2 flex items-center px-2">
                            {hoveredData ? (
                                <div className="text-sm md:text-base font-medium text-gray-800 flex items-center gap-3 animate-in fade-in duration-200">
                                    <span className="font-bold text-gray-400">#{hoveredIndex! + 1}</span>
                                    <span className="truncate max-w-[200px] md:max-w-[400px]">{hoveredData[detailView.labelKey]}</span>
                                    <span className={`px-2 py-1 rounded-md bg-gray-100 text-gray-900 font-bold flex items-center gap-1`}>
                                        {hoveredData[detailView.valueKey]} {detailView.icon && <span className="opacity-60">{detailView.icon}</span>}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-400 italic flex items-center gap-2">
                                    Pasa el ratón sobre una barra para ver detalles
                                </div>
                            )}
                        </div>

                        {/* Vertical Bar Chart */}
                        <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 md:p-6 mb-8 overflow-hidden">
                            <div className="flex gap-1.5 overflow-x-auto items-end h-[300px] border-b border-gray-200 pb-2 px-1 custom-scrollbar">
                                {detailView.items.map((item, index) => {
                                    const val = Number(item[detailView.valueKey]) || 0;
                                    const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                                    const isHovered = hoveredIndex === index;
                                    
                                    return (
                                        <div 
                                            key={index} 
                                            className="w-8 md:w-10 flex-shrink-0 flex flex-col justify-end group cursor-pointer relative h-full transition-all"
                                            onMouseEnter={() => setHoveredIndex(index)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                            onTouchStart={() => setHoveredIndex(index)}
                                        >
                                            {/* Bar */}
                                            <div 
                                                className={`w-full rounded-t-sm transition-all duration-700 ease-in-out ${detailView.colorClass} shadow-sm ${isHovered ? 'opacity-100 ring-2 ring-offset-1 ring-gray-300' : 'opacity-70 group-hover:opacity-100'}`}
                                                style={{ height: `${Math.max(pct, 1)}%` }}
                                            />
                                            {/* Label under X-axis */}
                                            <div className={`text-[10px] md:text-xs text-center mt-2 font-medium ${isHovered ? 'text-gray-800' : 'text-gray-400'}`}>
                                                {index + 1}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Detail List */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Listado detallado</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {detailView.items.map((item, index) => {
                                    const content = (
                                        <div 
                                            className={`bg-gray-50 border rounded-lg p-3 flex justify-between items-center transition-colors group/item h-full ${hoveredIndex === index ? 'border-gray-400 bg-gray-100' : 'border-gray-100 hover:bg-gray-100'}`}
                                            onMouseEnter={() => setHoveredIndex(index)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                        >
                                            <div className="truncate pr-3 flex items-center gap-2">
                                                <span className="text-gray-400 text-xs font-bold w-5">{index + 1}.</span>
                                                <span className="text-sm font-medium text-gray-800 truncate group-hover/item:text-gray-900">{item[detailView.labelKey]}</span>
                                            </div>
                                            <span className="font-bold text-gray-900 text-sm whitespace-nowrap flex items-center gap-1">
                                                {detailView.icon && <span className="opacity-50">{detailView.icon}</span>}
                                                {item[detailView.valueKey] || 0}
                                            </span>
                                        </div>
                                    );

                                    if (detailView.isLink && item.user_id) {
                                        return (
                                            <Link href={`/admin/listings?userId=${String(item.user_id)}`} key={index} className="block">
                                                {content}
                                            </Link>
                                        );
                                    }
                                    if (detailView.isChatUser && item.user_id) {
                                        return (
                                            <button 
                                                onClick={() => {
                                                    setSelectedChatUserId(String(item.user_id));
                                                    setDetailView(null);
                                                }}
                                                key={index} 
                                                className="block w-full text-left"
                                            >
                                                {content}
                                            </button>
                                        );
                                    }
                                    return <div key={index}>{content}</div>;
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    if (selectedChatUserId) {
        return (
            <UserChatsExplorer 
                userId={selectedChatUserId} 
                onClose={() => setSelectedChatUserId(null)} 
            />
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in duration-300">
            {/* Panel Usuarios */}
            <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)]">
                        <Users className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)]">Insights Usuarios</h2>
                </div>

                <div className="space-y-6">
                    {/* Provinces */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Provincia con más Usuarios</h3>
                            <button onClick={() => openDetail('Provincias con más Usuarios', topProvinces, 'name', 'users_count', null, 'bg-emerald-500')} 
                            className="text-xs text-[var(--ag-sys-color-primary)] font-semibold flex items-center gap-1 hover:underline px-2 py-1 bg-[var(--ag-sys-color-primary)]/10 rounded-full">
                                <BarChart2 className="w-3 h-3"/> Ver todo
                            </button>
                        </div>
                        <div className="space-y-2">
                            {topProvinces.slice(0,5).map((prov: any, i: number) => (
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

                    {/* Recent Connected */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Usuarios más conectados hoy</h3>
                            <button onClick={() => openDetail('Usuarios más conectados hoy', topConnectedUsers, 'name', 'time_label', null, 'bg-emerald-500')} 
                            className="text-xs text-[var(--ag-sys-color-primary)] font-semibold flex items-center gap-1 hover:underline px-2 py-1 bg-[var(--ag-sys-color-primary)]/10 rounded-full" style={{display: 'none'}}>
                                <BarChart2 className="w-3 h-3"/> Ver todo
                            </button>
                        </div>
                        <div className="space-y-2">
                            {topConnectedUsers.slice(0,5).map((usr: any, i: number) => (
                                <div key={i} className="flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3">
                                    <span className="font-medium text-[var(--ag-sys-color-text)] truncate">{usr.name}</span>
                                    <span className="text-xs text-[var(--ag-sys-color-text-muted)]">
                                        {usr.last_sign_in_at ? new Date(usr.last_sign_in_at).toLocaleDateString() : 'Desconocido'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Top Listings */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Con más anuncios publicados</h3>
                            <button onClick={() => openDetail('Usuarios con más Anuncios', topUsersListings, 'name', 'listings_count', null, 'bg-emerald-500', true)} 
                            className="text-xs text-[var(--ag-sys-color-primary)] font-semibold flex items-center gap-1 hover:underline px-2 py-1 bg-[var(--ag-sys-color-primary)]/10 rounded-full">
                                <BarChart2 className="w-3 h-3"/> Ver todo
                            </button>
                        </div>
                        <div className="space-y-2">
                            {topUsersListings.slice(0,5).map((usr: any, i: number) => (
                                <Link href={`/admin/listings?userId=${usr.user_id}`} key={i} className="flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3 hover:bg-gray-50 transition-colors group">
                                    <span className="font-medium text-[var(--ag-sys-color-text)] truncate group-hover:text-[var(--ag-sys-color-primary)] transition-colors">{usr.name}</span>
                                    <span className="font-bold text-[var(--ag-sys-color-primary)]">{usr.listings_count} anuncios</span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Top Chats */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Con más chats</h3>
                            <button onClick={() => openDetail('Usuarios con más Chats', topUsersChats, 'name', 'chats_count', <MessageSquare className="w-3 h-3"/>, 'bg-blue-500', false, true)} 
                            className="text-xs text-[var(--ag-sys-color-primary)] font-semibold flex items-center gap-1 hover:underline px-2 py-1 bg-[var(--ag-sys-color-primary)]/10 rounded-full">
                                <BarChart2 className="w-3 h-3"/> Ver todo
                            </button>
                        </div>
                        <div className="space-y-2">
                            {topUsersChats.slice(0,5).map((usr, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setSelectedChatUserId(usr.user_id)}
                                    className="w-full flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3 hover:bg-[var(--ag-sys-color-primary)]/5 hover:border-[var(--ag-sys-color-primary)] border border-transparent transition-all text-left"
                                >
                                    <span className="font-medium text-[var(--ag-sys-color-text)] truncate">{usr.name}</span>
                                    <span className="font-bold text-[var(--ag-sys-color-primary)] flex items-center gap-1">
                                        <MessageSquare className="w-3.5 h-3.5 opacity-60" />
                                        {usr.chats_count} chats
                                    </span>
                                </button>
                            ))}
                            {topUsersChats.length === 0 && <p className="text-xs text-gray-500">Sin datos de chats...</p>}
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
                    {/* Top Categories */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Distribución por Categorías</h3>
                            <button onClick={() => openDetail('Categorías con más anuncios', topCategories, 'name', 'count', <Package className="w-3 h-3"/>, 'bg-amber-500')} 
                            className="text-xs text-[var(--ag-sys-color-primary)] font-semibold flex items-center gap-1 hover:underline px-2 py-1 bg-[var(--ag-sys-color-primary)]/10 rounded-full">
                                <BarChart2 className="w-3 h-3"/> Ver todo
                            </button>
                        </div>
                        <div className="space-y-2">
                            {topCategories?.slice(0,5).map((cat: any, i: number) => (
                                <div key={i} className="flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3">
                                    <span className="font-medium text-[var(--ag-sys-color-text)] truncate flex items-center gap-2"><Package className="w-4 h-4 text-gray-400"/> {cat.name}</span>
                                    <span className="font-bold text-[var(--ag-sys-color-primary)]">{cat.count} anuncios</span>
                                </div>
                            ))}
                            {(!topCategories || topCategories.length === 0) && <p className="text-xs text-gray-500">Sin categorías...</p>}
                        </div>
                    </section>
                    
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Más visitados</h3>
                            <button onClick={() => openDetail('Anuncios más visitados', topVisitedListings, 'title', 'visits_count', null, 'bg-emerald-500')} 
                            className="text-xs text-[var(--ag-sys-color-primary)] font-semibold flex items-center gap-1 hover:underline px-2 py-1 bg-[var(--ag-sys-color-primary)]/10 rounded-full">
                                <BarChart2 className="w-3 h-3"/> Ver todo
                            </button>
                        </div>
                        <div className="space-y-2">
                            {topVisitedListings?.slice(0,5).map((lst: any, i: number) => (
                                <div key={i} className="flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3">
                                    <span className="font-medium text-[var(--ag-sys-color-text)] truncate">{lst.title}</span>
                                    <span className="font-bold text-[var(--ag-sys-color-primary)]">{lst.visits_count || 0} views</span>
                                </div>
                            ))}
                            {(!topVisitedListings || topVisitedListings.length === 0) && <p className="text-xs text-gray-500">Sin datos de visitas...</p>}
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Con más likes</h3>
                            <button onClick={() => openDetail('Anuncios con más likes', topLikesListings, 'title', 'likes_count', <Heart className="w-3 h-3 fill-current"/>, 'bg-red-500')} 
                            className="text-xs text-[var(--ag-sys-color-primary)] font-semibold flex items-center gap-1 hover:underline px-2 py-1 bg-[var(--ag-sys-color-primary)]/10 rounded-full">
                                <BarChart2 className="w-3 h-3"/> Ver todo
                            </button>
                        </div>
                        <div className="space-y-2">
                            {topLikesListings.slice(0,5).map((lst: any, i: number) => (
                                <div key={i} className="flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3">
                                    <span className="font-medium text-[var(--ag-sys-color-text)] truncate">{lst.title}</span>
                                    <span className="font-bold text-red-500 flex items-center gap-1"><Heart className="w-4 h-4 fill-current"/> {lst.likes_count}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Con más interacciones (chats)</h3>
                            <button onClick={() => openDetail('Anuncios con más interacciones', topListingsChats, 'title', 'chats_count', <MessageSquare className="w-3 h-3"/>, 'bg-blue-500')} 
                            className="text-xs text-[var(--ag-sys-color-primary)] font-semibold flex items-center gap-1 hover:underline px-2 py-1 bg-[var(--ag-sys-color-primary)]/10 rounded-full">
                                <BarChart2 className="w-3 h-3"/> Ver todo
                            </button>
                        </div>
                        <div className="space-y-2">
                            {topListingsChats.slice(0,5).map((lst: any, i: number) => (
                                <div key={i} className="flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3">
                                    <span className="font-medium text-[var(--ag-sys-color-text)] truncate">{lst.title}</span>
                                    <span className="font-bold text-blue-500 flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {lst.chats_count}</span>
                                </div>
                            ))}
                            {topListingsChats.length === 0 && <p className="text-xs text-gray-500">Sin datos de chats...</p>}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Conversión de las interfaces de Insights a alias de tipo (`type`) para que TypeScript asigne implícitamente index signatures y sean compatibles con `DetailItem` en la función genérica `openDetail`.
 * - Agregado de soporte para navegación y apertura directa del detalle de chats del usuario (`selectedChatUserId`) mediante callbacks desde el panel general de insights.
 * - Asegurado del tipo de dato `number` para el cálculo proporcional de barras del gráfico de estadísticas convirtiendo explícitamente mediante `Number(...)` para evitar advertencias de compilación y evitar el uso de `any`.
 * - Control de casos borde como usuarios sin identificador o conjuntos de datos nulos/vacíos en la carga estadística.
 */
