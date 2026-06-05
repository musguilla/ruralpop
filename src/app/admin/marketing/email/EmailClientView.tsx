"use client";

import React, { useState } from "react";
import { EMAIL_TEMPLATES, EQUIPOP_EMAIL_TEMPLATES, EmailTemplate } from "@/constants/emailTemplates";
import { Search, Send, Mail, ChevronRight, CheckCircle2 } from "lucide-react";
import { sendTemplateEmail } from "./actions";

export default function EmailClientView({ tenant }: { tenant: string | null }) {
    const activeTemplates = tenant === 'equipop' ? EQUIPOP_EMAIL_TEMPLATES : EMAIL_TEMPLATES;

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(activeTemplates[0]?.id || null);
    const [recipientsInput, setRecipientsInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState<{msg: string, isError?: boolean} | null>(null);

    const filteredTemplates = activeTemplates.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedTemplate = activeTemplates.find(t => t.id === selectedTemplateId);

    const handleSend = async () => {
        if (!selectedTemplate) return;
        
        const emails = recipientsInput
            .split(",")
            .map(e => e.trim())
            .filter(e => e.length > 0 && e.includes("@"));

        if (emails.length === 0) {
            setSendSuccess({ msg: "Introduce al menos un correo electrónico válido.", isError: true });
            return;
        }

        setIsSending(true);
        setSendSuccess(null);

        const result = await sendTemplateEmail(
            emails, 
            selectedTemplate.subject, 
            selectedTemplate.htmlContent
        );

        setIsSending(false);

        if (result.success) {
            setSendSuccess({ msg: "¡Emails enviados correctamente!" });
            setRecipientsInput("");
        } else {
            setSendSuccess({ msg: result.error || "Hubo un error al enviar.", isError: true });
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[calc(100vh-12rem)] min-h-[900px]">
            {/* Sidebar (Templates List) */}
            <div className="md:col-span-4 flex flex-col gap-4 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-3xl p-5 overflow-hidden shadow-sm h-full">
                <div className="mb-2">
                    <h2 className="text-xl font-black text-[var(--ag-sys-color-text)] tracking-tight flex items-center gap-2">
                        <Mail className="w-5 h-5 text-[var(--ag-sys-color-primary)]" />
                        Plantillas
                    </h2>
                    <p className="text-xs text-[var(--ag-sys-color-text-muted)] font-bold uppercase tracking-wider mt-1">Selecciona el mensaje</p>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-[var(--ag-sys-color-text-muted)]" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar plantilla..."
                        className="w-full pl-10 pr-4 py-2 border border-[var(--ag-sys-color-border)] rounded-xl bg-transparent placeholder-[var(--ag-sys-color-text-muted)] outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/20 transition-all font-medium text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {filteredTemplates.map(template => (
                        <button
                            key={template.id}
                            onClick={() => {
                                setSelectedTemplateId(template.id);
                                setSendSuccess(null);
                            }}
                            className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedTemplateId === template.id ? 'bg-[var(--ag-sys-color-primary)]/5 border-[var(--ag-sys-color-primary)]' : 'border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] hover:bg-[var(--ag-sys-color-surface)]'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-black uppercase text-[var(--ag-sys-color-primary)] tracking-widest">{template.category}</span>
                                {selectedTemplateId === template.id && <ChevronRight className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />}
                            </div>
                            <h3 className="font-bold text-[var(--ag-sys-color-text)] text-sm mb-1">{template.name}</h3>
                            <p className="text-xs text-[var(--ag-sys-color-text-muted)] line-clamp-2 leading-relaxed">{template.description}</p>
                        </button>
                    ))}
                    
                    {filteredTemplates.length === 0 && (
                        <div className="text-center py-10 text-[var(--ag-sys-color-text-muted)] text-sm font-medium">
                            No se encontraron plantillas.
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area (Preview & Send) */}
            <div className="md:col-span-8 flex flex-col bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-3xl overflow-hidden shadow-sm h-full">
                {selectedTemplate ? (
                    <>
                        <div className="p-6 border-b border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)]">
                            <div className="mb-4">
                                <h2 className="text-2xl font-black text-[var(--ag-sys-color-text)] tracking-tight">{selectedTemplate.name}</h2>
                                <p className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] mt-1">Asunto: <span className="font-medium">{selectedTemplate.subject}</span></p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-black text-[var(--ag-sys-color-text)] uppercase tracking-wider mb-2">Destinatarios (separados por coma)</label>
                                    <input
                                        type="text"
                                        placeholder="ejemplo@empresa.com, otro@mail.com"
                                        value={recipientsInput}
                                        onChange={(e) => setRecipientsInput(e.target.value)}
                                        className="w-full px-4 py-2 border border-[var(--ag-sys-color-border)] rounded-xl bg-[var(--ag-sys-color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/20 transition-all font-medium text-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={isSending}
                                    className="px-6 py-2.5 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px]"
                                >
                                    {isSending ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <><Send className="w-4 h-4" /> Enviar</>
                                    )}
                                </button>
                            </div>

                            {sendSuccess && (
                                <div className={`mt-4 p-3 rounded-xl border text-sm font-bold flex items-center gap-2 ${sendSuccess.isError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                                    {!sendSuccess.isError && <CheckCircle2 className="w-4 h-4" />}
                                    {sendSuccess.msg}
                                </div>
                            )}
                        </div>

                        {/* Email Preview iframe */}
                        <div className="flex-1 bg-gray-100 p-8 overflow-y-auto custom-scrollbar flex justify-center border-t border-[var(--ag-sys-color-border)]">
                            <div 
                                className="w-full max-w-[600px] h-fit min-h-[800px] bg-white rounded-md shadow-lg overflow-hidden border border-gray-200"
                            >
                                <iframe 
                                    srcDoc={selectedTemplate.htmlContent} 
                                    title="Email Preview"
                                    className="w-full h-[800px] pointer-events-none"
                                    sandbox="allow-same-origin"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--ag-sys-color-text-muted)]">
                        <Mail className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-bold">Selecciona una plantilla de la izquierda para previsualizarla.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
