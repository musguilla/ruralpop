"use client";

import React, { useState } from "react";
import { Users, Package, MapPin, Heart, MessageSquare, X, BarChart2 } from "lucide-react";
import Link from "next/link";

type ModalData = {
    title: string;
    items: any[];
    labelKey: string;
    valueKey: string;
    icon: React.ReactNode;
    colorClass: string;
    isLink?: boolean;
};

export function InsightsPanels({
    topProvinces,
    topConnectedUsers,
    topUsersListings,
    topUsersChats,
    topVisitedListings,
    topLikesListings,
    topListingsChats
}: any) {
    const [modalData, setModalData] = useState<ModalData | null>(null);

    const openModal = (
        title: string,
        items: any[],
        labelKey: string,
        valueKey: string,
        icon: React.ReactNode,
        colorClass: string,
        isLink: boolean = false
    ) => {
        setModalData({ title, items, labelKey, valueKey, icon, colorClass, isLink });
    };

    const renderChartRow = (item: any, maxVal: number, data: ModalData, index: number) => {
        const val = item[data.valueKey] || 0;
        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
        
        const content = (
            <div className="relative z-10 flex justify-between items-center px-4 py-2 text-sm h-full">
                <span className="font-medium text-gray-800 truncate pr-4">
                    <span className="text-gray-400 mr-2">{index + 1}.</span> {item[data.labelKey]}
                </span>
                <span className="font-bold text-gray-900 whitespace-nowrap flex items-center gap-1">
                    {data.icon && <span className="opacity-70">{data.icon}</span>}
                    {val}
                </span>
            </div>
        );

        const row = (
            <div key={index} className="relative overflow-hidden rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors h-10 w-full group">
                <div 
                    className={`absolute inset-y-0 left-0 opacity-20 ${data.colorClass} group-hover:opacity-40 transition-opacity`} 
                    style={{ width: `${Math.max(pct, 1)}%` }}
                />
                {content}
            </div>
        );

        if (data.isLink && item.user_id) {
            return (
                <Link href={`/admin/listings?userId=${item.user_id}`} key={index} className="block w-full">
                    {row}
                </Link>
            );
        }
        return row;
    };

    return (
        <>
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
                        {/* Provinces */}
                        <section>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Provincia con más Usuarios</h3>
                                <button onClick={() => openModal('Provincias con más Usuarios', topProvinces, 'name', 'users_count', null, 'bg-emerald-500')} 
                                className="text-xs text-[var(--ag-sys-color-primary)] font-semibold flex items-center gap-1 hover:underline">
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
                            </div>
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

                        {/* Top Listings */}
                        <section>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Con más anuncios publicados</h3>
                                <button onClick={() => openModal('Usuarios con más Anuncios', topUsersListings, 'name', 'listings_count', null, 'bg-emerald-500', true)} 
                                className="text-xs text-[var(--ag-sys-color-primary)] font-semibold flex items-center gap-1 hover:underline">
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
                                <button onClick={() => openModal('Usuarios con más Chats', topUsersChats, 'name', 'chats_count', <MessageSquare className="w-3 h-3"/>, 'bg-blue-500')} 
                                className="text-xs text-[var(--ag-sys-color-primary)] font-semibold flex items-center gap-1 hover:underline">
                                    <BarChart2 className="w-3 h-3"/> Ver todo
                                </button>
                            </div>
                            <div className="space-y-2">
                                {topUsersChats.slice(0,5).map((usr: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center bg-[var(--ag-sys-color-background)] rounded-lg p-3">
                                        <span className="font-medium text-[var(--ag-sys-color-text)] truncate">{usr.name}</span>
                                        <span className="font-bold text-[var(--ag-sys-color-primary)]">{usr.chats_count} chats</span>
                                    </div>
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
                        <section>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Más visitados</h3>
                                <button onClick={() => openModal('Anuncios más visitados', topVisitedListings, 'title', 'visits_count', null, 'bg-emerald-500')} 
                                className="text-xs text-[var(--ag-sys-color-primary)] font-semibold flex items-center gap-1 hover:underline">
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
                                <button onClick={() => openModal('Anuncios con más likes', topLikesListings, 'title', 'likes_count', <Heart className="w-3 h-3 fill-current"/>, 'bg-red-500')} 
                                className="text-xs text-[var(--ag-sys-color-primary)] font-semibold flex items-center gap-1 hover:underline">
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
                                <button onClick={() => openModal('Anuncios con más interacciones', topListingsChats, 'title', 'chats_count', <MessageSquare className="w-3 h-3"/>, 'bg-blue-500')} 
                                className="text-xs text-[var(--ag-sys-color-primary)] font-semibold flex items-center gap-1 hover:underline">
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

            {/* Modal for Chart View */}
            {modalData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setModalData(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-gray-500" />
                                    {modalData.title}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Top 100 resultados - Gráfica ordenada</p>
                            </div>
                            <button 
                                onClick={() => setModalData(null)}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body / Chart */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 bg-white">
                            {modalData.items.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">No hay datos disponibles</div>
                            ) : (
                                (() => {
                                    const maxVal = Math.max(...modalData.items.map(i => i[modalData.valueKey] || 0));
                                    return modalData.items.map((item, index) => renderChartRow(item, maxVal, modalData, index));
                                })()
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
