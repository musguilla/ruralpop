"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Loader2, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/LocaleContext";

export function ClaimProfileFlow({ ghostToken }: { ghostToken: string }) {
    const { locale } = useTranslation();
    const isPt = locale === 'pt';
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
                throw new Error(err.error || (isPt ? 'Erro ao reclamar o perfil' : 'Error al reclamar el perfil'));
            }

            // Redirigir a la vista de login con mensaje de verificación
            const successMsg = isPt 
                ? "Verifique o seu email para validar a sua conta antes de aceder à sua montra." 
                : "Revisa tu correo electrónico para validar tu cuenta antes de acceder a tu escaparate.";
            router.push(`/login?message=${encodeURIComponent(successMsg)}`);
            
        } catch (err) {
            console.error("Claim error:", err);
            setError(err instanceof Error ? err.message : (isPt ? "Ocorreu um erro inesperado. Tente novamente." : "Ocurrió un error inesperado. Inténtalo de nuevo."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleClaim} className="bg-white rounded-[2rem] p-8 shadow-xl border border-[var(--ag-sys-color-primary)]/20">
            <h3 className="text-2xl font-black text-[var(--ag-sys-color-text)] mb-2">
                {isPt ? "Criar conta" : "Crear cuenta"}
            </h3>
            <p className="text-[var(--ag-sys-color-text-muted)] text-sm mb-8">
                {isPt 
                    ? "Introduza o seu email e uma palavra-passe para criar a sua conta associada a esta montra." 
                    : "Introduce tu email y una contraseña para crear tu cuenta de usuario asociada a este escaparate."}
            </p>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                    {error}
                </div>
            )}

            <div className="space-y-5 mb-8">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--ag-sys-color-text)] ml-1">
                        {isPt ? "Email da empresa" : "Email de empresa"}
                    </label>
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
                    <label className="text-sm font-bold text-[var(--ag-sys-color-text)] ml-1">
                        {isPt ? "Palavra-passe segura" : "Contraseña segura"}
                    </label>
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
                        {isPt ? "Criar conta e Continuar" : "Crear cuenta y Continuar"}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4 leading-relaxed">
                {isPt ? (
                    <>Ao criar a sua conta aceita os nossos <a href="/terms" className="underline hover:text-[var(--ag-sys-color-primary)]">Termos e Condições</a> e a <a href="/privacy" className="underline hover:text-[var(--ag-sys-color-primary)]">Política de Privacidade</a>.</>
                ) : (
                    <>Al crear tu cuenta aceptas nuestros <a href="/terms" className="underline hover:text-[var(--ag-sys-color-primary)]">Términos y Condiciones</a> y la <a href="/privacy" className="underline hover:text-[var(--ag-sys-color-primary)]">Política de Privacidad</a>.</>
                )}
            </p>
        </form>
    );
}
