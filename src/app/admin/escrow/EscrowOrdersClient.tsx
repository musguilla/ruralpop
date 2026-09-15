"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
    Search,
    Package,
    ArrowLeft,
    ExternalLink,
    Mail,
    Phone,
    Copy,
    Check,
    Calendar,
    Clock,
    User,
    Store,
    ShieldCheck,
    CreditCard,
    AlertCircle,
    X,
    Filter,
    Layers,
    ReceiptText,
    TrendingUp
} from "lucide-react";
import { slugify } from "@/utils/seoUtils";
import { encodeId } from "@/utils/idUtils";
import { TENANTS_CONFIG } from "@/config/tenants";

// --- 1. Interfaces ---
export interface EscrowUserContact {
    id: string;
    email: string | null;
    name: string | null;
    commercial_name: string | null;
    contact_phone: string | null;
}

export interface EscrowListingSummary {
    id: string;
    title: string;
    price: number | null;
    image_urls: string[] | null;
    location: string | null;
    tenant_id: string | null;
}

export interface EscrowOrderRecordFull {
    id: string;
    listing_id: string | null;
    buyer_id: string | null;
    seller_id: string | null;
    seller_email: string | null;
    gross_amount_cents: number | null;
    ruralpop_fee_cents: number | null;
    seller_net_amount_cents: number | null;
    currency: string | null;
    status: string;
    stripe_checkout_session_id: string | null;
    stripe_payment_intent_id: string | null;
    stripe_charge_id: string | null;
    stripe_transfer_id: string | null;
    stripe_connected_account_id: string | null;
    buyer_confirmed_at: string | null;
    seller_paid_at: string | null;
    cancelled_at: string | null;
    refunded_at: string | null;
    dispute_opened_at: string | null;
    created_at: string;
    updated_at: string;
    tenant_id: string | null;
    listing: EscrowListingSummary | null;
    buyer: EscrowUserContact | null;
    seller: EscrowUserContact | null;
}

interface EscrowOrdersClientProps {
    orders: EscrowOrderRecordFull[];
    currentTenant: string;
}

type StatusFilterType = 'all' | 'completed' | 'held' | 'pending' | 'refunded' | 'cancelled';
type TenantFilterType = 'current' | 'ruralpop' | 'equipop' | 'all';

export function EscrowOrdersClient({ orders, currentTenant }: EscrowOrdersClientProps) {
    const isEquipopDefault = currentTenant === 'equipop';
    const ruralpopTenantId = TENANTS_CONFIG['ruralpop'].id;
    const equipopTenantId = TENANTS_CONFIG['equipop'].id;

    // Filter states
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");
    const [tenantFilter, setTenantFilter] = useState<TenantFilterType>("current");
    const [selectedOrder, setSelectedOrder] = useState<EscrowOrderRecordFull | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Filtered orders
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            // Tenant filter
            if (tenantFilter === "current") {
                if (isEquipopDefault) {
                    if (order.tenant_id !== equipopTenantId && order.listing?.tenant_id !== equipopTenantId) {
                        return false;
                    }
                } else {
                    if (order.tenant_id === equipopTenantId || order.listing?.tenant_id === equipopTenantId) {
                        return false;
                    }
                }
            } else if (tenantFilter === "ruralpop") {
                if (order.tenant_id === equipopTenantId || order.listing?.tenant_id === equipopTenantId) {
                    return false;
                }
            } else if (tenantFilter === "equipop") {
                if (order.tenant_id !== equipopTenantId && order.listing?.tenant_id !== equipopTenantId) {
                    return false;
                }
            }

            // Status filter
            if (statusFilter === "completed") {
                if (order.status !== "paid_out" && order.status !== "delivered") return false;
            } else if (statusFilter === "held") {
                if (order.status !== "paid_held") return false;
            } else if (statusFilter === "pending") {
                if (order.status !== "pending_checkout") return false;
            } else if (statusFilter === "refunded") {
                if (order.status !== "refunded") return false;
            } else if (statusFilter === "cancelled") {
                if (order.status !== "cancelled") return false;
            }

            // Search query filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const title = order.listing?.title?.toLowerCase() || "";
                const buyerEmail = order.buyer?.email?.toLowerCase() || "";
                const buyerName = (order.buyer?.commercial_name || order.buyer?.name || "").toLowerCase();
                const buyerPhone = (order.buyer?.contact_phone || "").toLowerCase();
                const sellerEmail = (order.seller_email || order.seller?.email || "").toLowerCase();
                const sellerName = (order.seller?.commercial_name || order.seller?.name || "").toLowerCase();
                const sellerPhone = (order.seller?.contact_phone || "").toLowerCase();
                const orderId = order.id.toLowerCase();
                const stripePi = (order.stripe_payment_intent_id || "").toLowerCase();

                const matches = 
                    title.includes(q) ||
                    buyerEmail.includes(q) ||
                    buyerName.includes(q) ||
                    buyerPhone.includes(q) ||
                    sellerEmail.includes(q) ||
                    sellerName.includes(q) ||
                    sellerPhone.includes(q) ||
                    orderId.includes(q) ||
                    stripePi.includes(q);

                if (!matches) return false;
            }

            return true;
        });
    }, [orders, tenantFilter, isEquipopDefault, equipopTenantId, statusFilter, searchQuery]);

    // Summary KPIs computed dynamically based on current tenant filter
    const stats = useMemo(() => {
        const completed = filteredOrders.filter(o => o.status === "paid_out" || o.status === "delivered" || o.status === "paid_held");
        const totalGross = completed.reduce((sum, o) => sum + (o.gross_amount_cents || 0), 0) / 100;
        const totalFees = completed.reduce((sum, o) => sum + (o.ruralpop_fee_cents || 0), 0) / 100;
        const avgTicket = completed.length > 0 ? totalGross / completed.length : 0;

        return {
            totalOrders: filteredOrders.length,
            completedCount: completed.length,
            totalGross,
            totalFees,
            avgTicket
        };
    }, [filteredOrders]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid_out":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Completada
                    </span>
                );
            case "paid_held":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        En Custodia
                    </span>
                );
            case "delivered":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        Entregada
                    </span>
                );
            case "pending_checkout":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Pendiente pago
                    </span>
                );
            case "refunded":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Reembolsada
                    </span>
                );
            case "cancelled":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        Cancelada
                    </span>
                );
            case "dispute_opened":
            case "disputed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        En disputa
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 border border-slate-500/20">
                        {status}
                    </span>
                );
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    const formatDate = (isoString: string | null) => {
        if (!isoString) return "-";
        return new Date(isoString).toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin"
                            className="p-2 rounded-xl bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)] transition-colors"
                            title="Volver al dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-[var(--ag-sys-color-text)] tracking-tight">
                                Operaciones Escrow
                            </h1>
                            <p className="text-[var(--ag-sys-color-text-muted)] mt-1">
                                Detalle exhaustivo de pagos seguros, compradores, vendedores y comisiones.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-[var(--ag-sys-color-background)] p-1 rounded-2xl border border-[var(--ag-sys-color-border)]">
                    <button
                        onClick={() => setTenantFilter("current")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            tenantFilter === "current"
                                ? "bg-[var(--ag-sys-color-primary)] text-white shadow-sm"
                                : "text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                        }`}
                    >
                        {isEquipopDefault ? "Equipop" : "Ruralpop"}
                    </button>
                    <button
                        onClick={() => setTenantFilter(isEquipopDefault ? "ruralpop" : "equipop")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            tenantFilter === (isEquipopDefault ? "ruralpop" : "equipop")
                                ? "bg-[var(--ag-sys-color-primary)] text-white shadow-sm"
                                : "text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                        }`}
                    >
                        {isEquipopDefault ? "Ruralpop" : "Equipop"}
                    </button>
                    <button
                        onClick={() => setTenantFilter("all")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            tenantFilter === "all"
                                ? "bg-[var(--ag-sys-color-primary)] text-white shadow-sm"
                                : "text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                        }`}
                    >
                        Todos
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[var(--ag-sys-color-surface)] p-6 rounded-[2rem] border border-[var(--ag-sys-color-border)] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Ventas Escrow</p>
                            <h4 className="text-2xl font-black text-[var(--ag-sys-color-text)] mt-1">
                                {formatCurrency(stats.totalGross)}
                            </h4>
                            <p className="text-xs text-[var(--ag-sys-color-text-muted)] mt-0.5">
                                {stats.completedCount} completadas
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--ag-sys-color-surface)] p-6 rounded-[2rem] border border-[var(--ag-sys-color-border)] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                            <ReceiptText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Comisiones Ganadas</p>
                            <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                {formatCurrency(stats.totalFees)}
                            </h4>
                            <p className="text-xs text-[var(--ag-sys-color-text-muted)] mt-0.5">
                                Ingreso plataforma
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--ag-sys-color-surface)] p-6 rounded-[2rem] border border-[var(--ag-sys-color-border)] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Total Órdenes</p>
                            <h4 className="text-2xl font-black text-[var(--ag-sys-color-text)] mt-1">
                                {stats.totalOrders}
                            </h4>
                            <p className="text-xs text-[var(--ag-sys-color-text-muted)] mt-0.5">
                                Registradas en sistema
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--ag-sys-color-surface)] p-6 rounded-[2rem] border border-[var(--ag-sys-color-border)] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Ticket Medio</p>
                            <h4 className="text-2xl font-black text-[var(--ag-sys-color-text)] mt-1">
                                {formatCurrency(stats.avgTicket)}
                            </h4>
                            <p className="text-xs text-[var(--ag-sys-color-text-muted)] mt-0.5">
                                Por venta completada
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                {/* Search input */}
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ag-sys-color-text-muted)]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por comprador, vendedor, anuncio, ID..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl text-sm text-[var(--ag-sys-color-text)] placeholder:text-[var(--ag-sys-color-text-muted)] focus:outline-none focus:border-[var(--ag-sys-color-primary)] transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Status filter tabs */}
                <div className="flex flex-wrap gap-1.5 bg-[var(--ag-sys-color-surface)] p-1.5 rounded-2xl border border-[var(--ag-sys-color-border)]">
                    <button
                        onClick={() => setStatusFilter("all")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === "all"
                                ? "bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] shadow-sm"
                                : "text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                        }`}
                    >
                        Todas ({filteredOrders.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter("completed")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === "completed"
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                        }`}
                    >
                        Completadas
                    </button>
                    <button
                        onClick={() => setStatusFilter("held")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === "held"
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                        }`}
                    >
                        En Custodia
                    </button>
                    <button
                        onClick={() => setStatusFilter("pending")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === "pending"
                                ? "bg-amber-500 text-white shadow-sm"
                                : "text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                        }`}
                    >
                        Pendientes
                    </button>
                    <button
                        onClick={() => setStatusFilter("refunded")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === "refunded"
                                ? "bg-rose-500 text-white shadow-sm"
                                : "text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                        }`}
                    >
                        Reembolsadas
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[var(--ag-sys-color-surface)] rounded-[2rem] border border-[var(--ag-sys-color-border)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--ag-sys-color-background)]/60 border-b border-[var(--ag-sys-color-border)]">
                                <th className="px-6 py-4 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Fecha / Estado</th>
                                <th className="px-6 py-4 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Anuncio</th>
                                <th className="px-6 py-4 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Comprador</th>
                                <th className="px-6 py-4 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Vendedor</th>
                                <th className="px-6 py-4 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider text-right">Venta / Comisión</th>
                                <th className="px-4 py-4 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider text-center">Detalle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--ag-sys-color-border)] text-sm">
                            {filteredOrders.map((order) => {
                                const gross = (order.gross_amount_cents || 0) / 100;
                                const fee = (order.ruralpop_fee_cents || 0) / 100;
                                const sellerNet = (order.seller_net_amount_cents || 0) / 100;

                                const buyerName = order.buyer?.commercial_name || order.buyer?.name || "Comprador";
                                const buyerEmail = order.buyer?.email;
                                const buyerPhone = order.buyer?.contact_phone;

                                const sellerName = order.seller?.commercial_name || order.seller?.name || "Vendedor";
                                const sellerEmail = order.seller_email || order.seller?.email;
                                const sellerPhone = order.seller?.contact_phone;

                                const listing = order.listing;
                                const listingImage = listing?.image_urls?.[0];
                                const listingSlugUrl = listing 
                                    ? `/anuncio/${slugify(listing.title)}-${encodeId(listing.id)}`
                                    : null;

                                return (
                                    <tr 
                                        key={order.id} 
                                        className="hover:bg-[var(--ag-sys-color-background)]/40 transition-colors group cursor-pointer"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        {/* Fecha y Estado */}
                                        <td className="px-6 py-4 whitespace-nowrap align-top">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(order.status)}
                                                    {order.tenant_id === equipopTenantId && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-orange-500/10 text-orange-600 border border-orange-500/20">
                                                            Equipop
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-[var(--ag-sys-color-text-muted)] flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(order.created_at)}
                                                </span>
                                                <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--ag-sys-color-text-muted)]">
                                                    <span>#{order.id.slice(0, 8)}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopy(order.id, `id-${order.id}`);
                                                        }}
                                                        className="hover:text-[var(--ag-sys-color-text)] transition-colors"
                                                        title="Copiar ID de orden"
                                                    >
                                                        {copiedId === `id-${order.id}` ? (
                                                            <Check className="w-3 h-3 text-emerald-500" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Anuncio */}
                                        <td className="px-6 py-4 align-top max-w-xs">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {listingImage ? (
                                                        <img 
                                                            src={listingImage} 
                                                            alt={listing?.title || "Anuncio"} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-[var(--ag-sys-color-text-muted)]" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    {listingSlugUrl ? (
                                                        <a
                                                            href={listingSlugUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="font-bold text-sm text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors flex items-center gap-1 line-clamp-2"
                                                        >
                                                            {listing?.title || "Anuncio eliminado"}
                                                            <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50 group-hover:opacity-100" />
                                                        </a>
                                                    ) : (
                                                        <span className="font-bold text-sm text-[var(--ag-sys-color-text)] line-clamp-2">
                                                            {listing?.title || "Anuncio sin título"}
                                                        </span>
                                                    )}
                                                    {listing?.location && (
                                                        <span className="text-xs text-[var(--ag-sys-color-text-muted)] truncate mt-0.5">
                                                            {listing.location}
                                                        </span>
                                                    )}
                                                    {listing?.price !== undefined && listing?.price !== null && (
                                                        <span className="text-xs font-bold text-[var(--ag-sys-color-text)] mt-0.5">
                                                            Precio anuncio: {formatCurrency(listing.price)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Comprador con datos de contacto */}
                                        <td className="px-6 py-4 align-top max-w-xs">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 font-bold text-[var(--ag-sys-color-text)]">
                                                    <User className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                                    <span className="truncate">{buyerName}</span>
                                                </div>
                                                {buyerEmail && (
                                                    <a
                                                        href={`mailto:${buyerEmail}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center gap-1.5 text-xs text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors truncate"
                                                        title={buyerEmail}
                                                    >
                                                        <Mail className="w-3 h-3 flex-shrink-0" />
                                                        <span className="truncate">{buyerEmail}</span>
                                                    </a>
                                                )}
                                                {buyerPhone ? (
                                                    <a
                                                        href={`tel:${buyerPhone}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                                                    >
                                                        <Phone className="w-3 h-3 flex-shrink-0" />
                                                        <span>{buyerPhone}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-[var(--ag-sys-color-text-muted)] italic">
                                                        Sin teléfono registrado
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Vendedor con datos de contacto */}
                                        <td className="px-6 py-4 align-top max-w-xs">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 font-bold text-[var(--ag-sys-color-text)]">
                                                    <Store className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                                                    <span className="truncate">{sellerName}</span>
                                                </div>
                                                {sellerEmail && (
                                                    <a
                                                        href={`mailto:${sellerEmail}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center gap-1.5 text-xs text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors truncate"
                                                        title={sellerEmail}
                                                    >
                                                        <Mail className="w-3 h-3 flex-shrink-0" />
                                                        <span className="truncate">{sellerEmail}</span>
                                                    </a>
                                                )}
                                                {sellerPhone ? (
                                                    <a
                                                        href={`tel:${sellerPhone}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                                                    >
                                                        <Phone className="w-3 h-3 flex-shrink-0" />
                                                        <span>{sellerPhone}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-[var(--ag-sys-color-text-muted)] italic">
                                                        Sin teléfono registrado
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Transacción y Comisión */}
                                        <td className="px-6 py-4 align-top text-right whitespace-nowrap">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="font-black text-base text-[var(--ag-sys-color-text)]">
                                                    {formatCurrency(gross)}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span className="text-[var(--ag-sys-color-text-muted)]">Comisión:</span>
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                                        +{formatCurrency(fee)}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-[var(--ag-sys-color-text-muted)]">
                                                    Neto vendedor: {formatCurrency(sellerNet)}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Botón Ver Detalle */}
                                        <td className="px-4 py-4 align-middle text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOrder(order);
                                                }}
                                                className="p-2 rounded-xl bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] hover:bg-[var(--ag-sys-color-primary)] hover:text-white transition-colors"
                                                title="Ver detalle completo"
                                            >
                                                <Search className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-[var(--ag-sys-color-text-muted)]">
                                        <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p className="font-bold text-base">No se encontraron operaciones de escrow</p>
                                        <p className="text-sm mt-1">Prueba a cambiar los filtros o el término de búsqueda.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedOrder && (
                <div 
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div 
                        className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-[var(--ag-sys-color-border)] flex justify-between items-center bg-[var(--ag-sys-color-background)]/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-[var(--ag-sys-color-text)]">
                                            Operación Escrow #{selectedOrder.id.slice(0, 8)}
                                        </h3>
                                        {getStatusBadge(selectedOrder.status)}
                                    </div>
                                    <p className="text-xs text-[var(--ag-sys-color-text-muted)]">
                                        {formatDate(selectedOrder.created_at)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 rounded-xl text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-background)] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Economic Breakdown */}
                            <div className="bg-[var(--ag-sys-color-background)] rounded-2xl p-5 border border-[var(--ag-sys-color-border)] space-y-3">
                                <h4 className="text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">
                                    Desglose Financiero
                                </h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-[var(--ag-sys-color-surface)] p-3 rounded-xl border border-[var(--ag-sys-color-border)]">
                                        <p className="text-xs text-[var(--ag-sys-color-text-muted)]">Venta Total</p>
                                        <p className="text-xl font-black text-[var(--ag-sys-color-text)] mt-0.5">
                                            {formatCurrency((selectedOrder.gross_amount_cents || 0) / 100)}
                                        </p>
                                    </div>
                                    <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Comisión Plataforma</p>
                                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                            +{formatCurrency((selectedOrder.ruralpop_fee_cents || 0) / 100)}
                                        </p>
                                    </div>
                                    <div className="bg-[var(--ag-sys-color-surface)] p-3 rounded-xl border border-[var(--ag-sys-color-border)]">
                                        <p className="text-xs text-[var(--ag-sys-color-text-muted)]">Neto Vendedor</p>
                                        <p className="text-xl font-black text-[var(--ag-sys-color-text)] mt-0.5">
                                            {formatCurrency((selectedOrder.seller_net_amount_cents || 0) / 100)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Anuncio */}
                            <div className="bg-[var(--ag-sys-color-surface)] rounded-2xl p-5 border border-[var(--ag-sys-color-border)] space-y-3">
                                <h4 className="text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">
                                    Anuncio Relacionado
                                </h4>
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {selectedOrder.listing?.image_urls?.[0] ? (
                                            <img 
                                                src={selectedOrder.listing.image_urls[0]} 
                                                alt={selectedOrder.listing.title} 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <Package className="w-7 h-7 text-[var(--ag-sys-color-text-muted)]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-base text-[var(--ag-sys-color-text)]">
                                            {selectedOrder.listing?.title || "Anuncio sin título"}
                                        </h5>
                                        {selectedOrder.listing?.location && (
                                            <p className="text-xs text-[var(--ag-sys-color-text-muted)] mt-0.5">
                                                {selectedOrder.listing.location}
                                            </p>
                                        )}
                                        {selectedOrder.listing && (
                                            <a
                                                href={`/anuncio/${slugify(selectedOrder.listing.title)}-${encodeId(selectedOrder.listing.id)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--ag-sys-color-primary)] hover:underline mt-2"
                                            >
                                                Ver anuncio en la web
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Buyer & Seller Contact Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Comprador */}
                                <div className="bg-[var(--ag-sys-color-background)] rounded-2xl p-5 border border-[var(--ag-sys-color-border)] space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            Comprador
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="font-bold text-[var(--ag-sys-color-text)]">
                                            {selectedOrder.buyer?.commercial_name || selectedOrder.buyer?.name || "Sin nombre registrado"}
                                        </p>
                                        {selectedOrder.buyer?.email ? (
                                            <a
                                                href={`mailto:${selectedOrder.buyer.email}`}
                                                className="flex items-center gap-2 text-xs text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors"
                                            >
                                                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate">{selectedOrder.buyer.email}</span>
                                            </a>
                                        ) : (
                                            <span className="text-xs text-[var(--ag-sys-color-text-muted)] italic">Sin email</span>
                                        )}
                                        {selectedOrder.buyer?.contact_phone ? (
                                            <a
                                                href={`tel:${selectedOrder.buyer.contact_phone}`}
                                                className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                            >
                                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span>{selectedOrder.buyer.contact_phone}</span>
                                            </a>
                                        ) : (
                                            <span className="text-xs text-[var(--ag-sys-color-text-muted)] italic">Sin teléfono</span>
                                        )}
                                    </div>
                                </div>

                                {/* Vendedor */}
                                <div className="bg-[var(--ag-sys-color-background)] rounded-2xl p-5 border border-[var(--ag-sys-color-border)] space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-purple-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Store className="w-3.5 h-3.5" />
                                            Vendedor
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="font-bold text-[var(--ag-sys-color-text)]">
                                            {selectedOrder.seller?.commercial_name || selectedOrder.seller?.name || "Sin nombre registrado"}
                                        </p>
                                        {(selectedOrder.seller_email || selectedOrder.seller?.email) ? (
                                            <a
                                                href={`mailto:${selectedOrder.seller_email || selectedOrder.seller?.email}`}
                                                className="flex items-center gap-2 text-xs text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors"
                                            >
                                                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate">{selectedOrder.seller_email || selectedOrder.seller?.email}</span>
                                            </a>
                                        ) : (
                                            <span className="text-xs text-[var(--ag-sys-color-text-muted)] italic">Sin email</span>
                                        )}
                                        {selectedOrder.seller?.contact_phone ? (
                                            <a
                                                href={`tel:${selectedOrder.seller.contact_phone}`}
                                                className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                            >
                                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span>{selectedOrder.seller.contact_phone}</span>
                                            </a>
                                        ) : (
                                            <span className="text-xs text-[var(--ag-sys-color-text-muted)] italic">Sin teléfono</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Technical Stripe & Audit Metadata */}
                            <div className="bg-[var(--ag-sys-color-surface)] rounded-2xl p-5 border border-[var(--ag-sys-color-border)] space-y-3">
                                <h4 className="text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">
                                    Auditoría Técnica & Stripe
                                </h4>
                                <div className="space-y-2 text-xs font-mono">
                                    <div className="flex justify-between items-center py-1 border-b border-[var(--ag-sys-color-border)]">
                                        <span className="text-[var(--ag-sys-color-text-muted)]">ID Orden (UUID):</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[var(--ag-sys-color-text)] select-all">{selectedOrder.id}</span>
                                            <button
                                                onClick={() => handleCopy(selectedOrder.id, `modal-id-${selectedOrder.id}`)}
                                                className="hover:text-[var(--ag-sys-color-primary)]"
                                            >
                                                {copiedId === `modal-id-${selectedOrder.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </div>

                                    {selectedOrder.stripe_payment_intent_id && (
                                        <div className="flex justify-between items-center py-1 border-b border-[var(--ag-sys-color-border)]">
                                            <span className="text-[var(--ag-sys-color-text-muted)]">Payment Intent:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[var(--ag-sys-color-text)] select-all">{selectedOrder.stripe_payment_intent_id}</span>
                                                <button
                                                    onClick={() => handleCopy(selectedOrder.stripe_payment_intent_id!, `modal-pi-${selectedOrder.id}`)}
                                                    className="hover:text-[var(--ag-sys-color-primary)]"
                                                >
                                                    {copiedId === `modal-pi-${selectedOrder.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {selectedOrder.stripe_transfer_id && (
                                        <div className="flex justify-between items-center py-1 border-b border-[var(--ag-sys-color-border)]">
                                            <span className="text-[var(--ag-sys-color-text-muted)]">Transfer ID:</span>
                                            <span className="text-[var(--ag-sys-color-text)] select-all">{selectedOrder.stripe_transfer_id}</span>
                                        </div>
                                    )}

                                    {selectedOrder.stripe_connected_account_id && (
                                        <div className="flex justify-between items-center py-1 border-b border-[var(--ag-sys-color-border)]">
                                            <span className="text-[var(--ag-sys-color-text-muted)]">Stripe Connect (Vendedor):</span>
                                            <span className="text-[var(--ag-sys-color-text)] select-all">{selectedOrder.stripe_connected_account_id}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-[var(--ag-sys-color-text-muted)]">Plataforma:</span>
                                        <span className="font-sans font-bold text-[var(--ag-sys-color-text)]">
                                            {selectedOrder.tenant_id === equipopTenantId ? "Equipop" : "Ruralpop"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)]/50 flex justify-end">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-5 py-2.5 bg-[var(--ag-sys-color-primary)] text-white rounded-xl text-sm font-bold shadow hover:opacity-95 transition-opacity"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Implementada vista detalle integral para Operaciones de Escrow accesible vía lupa desde los widgets del Admin.
 * - Muestra de forma directa comprador con datos de contacto (nombre, email, teléfono), vendedor con datos de contacto,
 *   anuncio con thumbnail, enlace y precio, junto a importe de transacción y comisión ganada.
 * - Filtros rápidos interactivos: selector de tenant (Ruralpop / Equipop / Todos), filtro por estado y buscador reactivo.
 * - Modal detallado de auditoría técnica con desglose financiero, datos de envío/contacto e IDs de Stripe para soporte y control.
 * - Type safety estricto: cero uso de `any`, uso exclusivo de tokens oficiales Antigravity `var(--ag-sys-...)`.
 */
