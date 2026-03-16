"use client";

import React, { useState } from "react";
import { Copy, Mail, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { slugify } from "@/utils/seoUtils";
import { sendGhostInvites, saveCompanyEmails } from "./actions";

type GhostCompany = {
    id: string;
    commercial_name: string;
    ghost_token: string;
    avatar_url: string;
    company_logo_url: string;
    created_at: string;
    email: string | null;
};

interface GhostCompaniesTableProps {
    companies: GhostCompany[];
}

export function GhostCompaniesTable({ companies }: GhostCompaniesTableProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [emailsMap, setEmailsMap] = useState<Record<string, string>>({});

    const getEmailForCompany = (id: string) => {
        if (emailsMap[id] !== undefined) {
            return emailsMap[id];
        }
        const company = companies.find(c => c.id === id);
        if (company && company.email && !company.email.endsWith('@ruralpop.com')) {
            return company.email;
        }
        return "";
    };
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === companies.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(companies.map(c => c.id)));
        }
    };

    const handleEmailChange = (id: string, value: string) => {
        setEmailsMap(prev => ({ ...prev, [id]: value }));
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("Enlace copiado al portapapeles");
        } catch (e) {
            console.error("No se pudo copiar", e);
        }
    };

    const handleSendInvites = async () => {
        if (selectedIds.size === 0) {
            alert("Selecciona al menos una empresa.");
            return;
        }

        const payload = Array.from(selectedIds).map(id => {
            const company = companies.find(c => c.id === id)!;
            const emails = getEmailForCompany(id).split(",").map(e => e.trim()).filter(Boolean);
            return {
                companyId: id,
                commercialName: company.commercial_name,
                token: company.ghost_token,
                emails
            };
        });

        const missingEmails = payload.some(p => p.emails.length === 0);
        if (missingEmails) {
            alert("Algunas empresas seleccionadas no tienen correos asignados.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await sendGhostInvites(payload);
            if (res.error) {
                alert(res.error);
            } else {
                alert(`Invitaciones enviadas correctamente (${res.count} correos).`);
                // Clear selection
                setSelectedIds(new Set());
                setEmailsMap({});
            }
        } catch (e: any) {
            alert("Error inesperado al enviar correos.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Toolbar */}
            <div className="p-4 border-b border-[var(--ag-sys-color-border)] flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--ag-sys-color-text-muted)]">
                        {selectedIds.size} seleccionadas
                    </span>
                </div>
                <button
                    onClick={handleSendInvites}
                    disabled={selectedIds.size === 0 || isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-white text-sm font-bold rounded-xl hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    Enviar Invitaciones
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--ag-sys-color-surface)] border-b border-[var(--ag-sys-color-border)]">
                            <th className="p-4 font-semibold text-[13px] text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider w-12">
                                <label className="flex items-center justify-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={companies.length > 0 && selectedIds.size === companies.length}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-[var(--ag-sys-color-primary)] focus:ring-[var(--ag-sys-color-primary)]"
                                    />
                                </label>
                            </th>
                            <th className="p-4 font-semibold text-[13px] text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Empresa</th>
                            <th className="p-4 font-semibold text-[13px] text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Enlace Mágico</th>
                            <th className="p-4 font-semibold text-[13px] text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider min-w-[300px]">Emails destino</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--ag-sys-color-border)]">
                        {companies.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-[var(--ag-sys-color-text-muted)]">
                                    No hay perfiles fantasma creados actualmente.
                                </td>
                            </tr>
                        ) : companies.map(company => {
                            const isSelected = selectedIds.has(company.id);
                            const magicUrlPath = `/empresa/${slugify(company.commercial_name)}?token=${company.ghost_token}`;
                            
                            // Client-side origin building
                            const urlObj = typeof window !== 'undefined' ? new URL(window.location.href) : null;
                            const baseUrl = urlObj ? `${urlObj.protocol}//${urlObj.host}` : 'https://www.ruralpop.com';
                            const absoluteMagicUrl = `${baseUrl}${magicUrlPath}`;

                            return (
                                <tr key={company.id} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-blue-50/20' : ''}`}>
                                    <td className="p-4">
                                        <label className="flex items-center justify-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelect(company.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-[var(--ag-sys-color-primary)] focus:ring-[var(--ag-sys-color-primary)]"
                                            />
                                        </label>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {company.avatar_url || company.company_logo_url ? (
                                                <img src={company.avatar_url || company.company_logo_url} alt={company.commercial_name} className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center font-bold text-gray-400">
                                                    {company.commercial_name.charAt(0)}
                                                </div>
                                            )}
                                            <span className="font-bold text-[var(--ag-sys-color-text)]">{company.commercial_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 max-w-[200px] xl:max-w-xs overflow-hidden">
                                                <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200 truncate">
                                                    {magicUrlPath}
                                                </code>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => copyToClipboard(absoluteMagicUrl)}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary-hover)] transition-colors"
                                                >
                                                    <Copy className="w-3.5 h-3.5" /> Copiar
                                                </button>
                                                <a 
                                                    href={absoluteMagicUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                                                    title="Previsualizar"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" /> Ver
                                                </a>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <input
                                            type="text"
                                            placeholder="ejemplo@deheus.com, ceo@deheus.com"
                                            value={getEmailForCompany(company.id)}
                                            onChange={(e) => handleEmailChange(company.id, e.target.value)}
                                            onBlur={async (e) => {
                                                const value = e.target.value;
                                                if (value.trim()) {
                                                    await saveCompanyEmails(company.id, value);
                                                }
                                            }}
                                            className="w-full bg-white border border-[var(--ag-sys-color-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
