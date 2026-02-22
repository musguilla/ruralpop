"use client";

import React, { useState } from "react";
import { Loader2, DownloadCloud, CheckCircle } from "lucide-react";
import { CATEGORIES } from "@/constants/categories";

export function ImportForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [logs, setLogs] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
    const [selectedSubcategory, setSelectedSubcategory] = useState("");

    const currentSubcategories = CATEGORIES.find(c => c.id === selectedCategory)?.subcategories || [];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const url = formData.get("url") as string;
        const cookie = formData.get("cookie") as string;
        const limitStr = formData.get("limit") as string;
        const limit = parseInt(limitStr) || 10;

        if (!url) {
            alert("Por favor introduce una URL válida.");
            return;
        }

        setIsLoading(true);
        setStatus("Obteniendo listado de anuncios...");
        setLogs([]);

        const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

        try {
            // 1. Fetch the list of ads
            const listRes = await fetch("/api/scrape/milanuncios/list", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, cookie }),
            });

            const listData = await listRes.json();

            if (!listRes.ok) throw new Error(listData.error || "Error obteniendo el listado.");
            if (!listData.adUrls || listData.adUrls.length === 0) throw new Error("No se encontraron anuncios en esta URL.");

            const urlsToProcess = listData.adUrls.slice(0, limit);
            addLog(`Encontrados ${listData.adUrls.length} anuncios. Procesando los primeros ${urlsToProcess.length}...`);

            let successCount = 0;

            // 2. Fetch each ad
            for (let i = 0; i < urlsToProcess.length; i++) {
                const adUrl = urlsToProcess[i];
                setStatus(`Importando anuncio ${i + 1} de ${urlsToProcess.length}...`);

                try {
                    const adRes = await fetch("/api/scrape/milanuncios/ad", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url: adUrl, cookie, category: selectedCategory, subcategory: selectedSubcategory }),
                    });

                    const adData = await adRes.json();

                    if (!adRes.ok) {
                        addLog(`⚠️ Anuncio ${i + 1} falló: ${adData.error}`);
                    } else {
                        addLog(`✅ Importado: ${adData.data.title.substring(0, 30)}... (Tel: ${adData.data.phone || 'N/A'})`);
                        successCount++;
                    }
                } catch (err: any) {
                    addLog(`⚠️ Anuncio ${i + 1} falló: ${err.message}`);
                }
            }

            setStatus(`¡Importación finalizada! (${successCount} guardados)`);

        } catch (error: any) {
            setStatus("Error en la importación");
            addLog(`❌ Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Fuente de Datos</label>
                <select className="w-full h-12 px-4 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition-all font-bold">
                    <option value="milanuncios">Milanuncios (Premium Scraper)</option>
                    <option value="wallapop" disabled>Wallapop (Próximamente)</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Categoría Destino</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setSelectedSubcategory("");
                        }}
                        className="w-full h-12 px-4 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition-all"
                    >
                        {CATEGORIES.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Subcategoría (Opcional)</label>
                    <select
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition-all disabled:opacity-50"
                        disabled={currentSubcategories.length === 0}
                    >
                        <option value="">-- Sin subcategoría --</option>
                        {currentSubcategories.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">URL del listado (Milanuncios)</label>
                <input
                    type="url"
                    name="url"
                    required
                    placeholder="https://www.milanuncios.com/tractores/"
                    className="w-full h-12 px-4 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Número máximo de registros a importar</label>
                <input
                    type="number"
                    name="limit"
                    defaultValue={10}
                    min={1}
                    max={50}
                    className="w-full h-12 px-4 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Cookie de Sesión (Opcional - Requerido para ver Teléfonos)</label>
                <textarea
                    name="cookie"
                    placeholder="Pega aquí la cabecera 'Cookie' de tus peticiones en Milanuncios para poder extraer teléfonos ocultos."
                    className="w-full h-24 p-4 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition-all text-xs font-mono"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-4 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--ag-sys-color-primary)]/20"
            >
                {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Procesando Importación...</>
                ) : (
                    <><DownloadCloud className="w-5 h-5" /> Iniciar Importación Premium</>
                )}
            </button>

            {/* Status & Logs */}
            {(status || logs.length > 0) && (
                <div className="mt-8 p-6 bg-gray-900 rounded-2xl border border-gray-800 text-gray-300 font-mono text-xs overflow-hidden">
                    <div className="flex items-center gap-2 text-white font-bold mb-4 text-sm">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[var(--ag-sys-color-primary)]" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                        {status}
                    </div>
                    <div className="space-y-2 opacity-80">
                        {logs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                </div>
            )}
        </form>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se separa el formulario a un Client Component (`ImportForm`) para poder manejar el estado de carga y logs visualmente.
 * - Incluye un área para pegar la Cookie requerida para extraer los teléfonos detrás de auth.
 */
