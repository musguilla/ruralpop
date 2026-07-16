"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Loader2, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export function ClaimProfileFlow({ ghostToken }: { ghostToken: string }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Check if we are in Equipop or Ruralpop to pass tenant info
            const isEquipop = window.location.hostname.includes("equipop");
            const tenant = isEquipop ? 'equipop' : 'ruralpop';

            const response = await fetch('/api/claim-ghost-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ghostToken,
                    email,
                    password,
                    tenant
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error al reclamar el perfil');
            }

            // Redirigir a la vista de login con mensaje de verificación
            router.push(`/login?message=${encodeURIComponent("Revisa tu correo electrónico para validar tu cuenta antes de acceder a tu escaparate.")}`);
            
        } catch (err) {
            console.error("Claim error:", err);
            setError(err instanceof Error ? err.message : "Ocurrió un error inesperado. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleClaim} className="bg-white rounded-[2rem] p-8 shadow-xl border border-[var(--ag-sys-color-primary)]/20">
            <h3 className="text-2xl font-black text-[var(--ag-sys-color-text)] mb-2">Crear cuenta</h3>
            <p className="text-[var(--ag-sys-color-text-muted)] text-sm mb-8">
                Introduce tu email y una contraseña para crear tu cuenta de usuario asociada a este escaparate.
            </p>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                    {error}
                </div>
            )}

            <div className="space-y-5 mb-8">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--ag-sys-color-text)] ml-1">Email de empresa</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@empresa.com"
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] focus:bg-white transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--ag-sys-color-text)] ml-1">Contraseña segura</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] focus:bg-white transition-all"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--ag-sys-color-primary)] text-white font-bold py-4 px-6 rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        Crear cuenta y Continuar
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4 leading-relaxed">
                Al crear tu cuenta aceptas nuestros <a href="#" className="underline hover:text-[var(--ag-sys-color-primary)]">Términos y Condiciones</a> y la <a href="#" className="underline hover:text-[var(--ag-sys-color-primary)]">Política de Privacidad</a>.
            </p>
        </form>
    );
}
