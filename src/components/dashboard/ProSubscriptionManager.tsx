"use client";

import React, { useState } from "react";
import { Building2, ShieldCheck, Calendar, RefreshCw, CreditCard, ChevronRight, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProSubscriptionManagerProps {
    planType: string;
    renewsAt: string | null;
    stripeSubscriptionId: string | null;
}

export function ProSubscriptionManager({ planType, renewsAt, stripeSubscriptionId }: ProSubscriptionManagerProps) {
    const router = useRouter();
    const [isManaging, setIsManaging] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const formattedDate = renewsAt 
        ? new Date(renewsAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
        : "Pendiente";

    const isPro = planType === "pro";
    const targetPlan = isPro ? "start" : "pro";
    const targetPlanName = targetPlan.toUpperCase();

    const handleAction = async (action: 'change_plan' | 'cancel') => {
        setIsPending(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await fetch("/api/manage-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    targetPlan: action === 'change_plan' ? targetPlan : undefined
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al procesar la solicitud");
            }

            if (action === 'change_plan') {
                setSuccessMessage(`Tu plan cambiará a ${targetPlanName} a partir del ${formattedDate}.`);
            } else {
                setSuccessMessage(`Tu suscripción ha sido cancelada. Tu perfil pasará a ser de usuario normal el ${formattedDate}.`);
            }
            
            setIsManaging(false);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setIsPending(false);
        }
    };

    if (isManaging) {
        return (
            <div className="max-w-2xl">
                <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-[var(--ag-sys-color-border)] flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)]">Gestionar Plan {planType.toUpperCase()}</h2>
                        <button onClick={() => setIsManaging(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-8 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-lg text-[var(--ag-sys-color-text)] mb-2">Cambiar a Plan {targetPlanName}</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Tu plan actual es {planType.toUpperCase()}. Si cambias al plan {targetPlanName}, 
                                el cambio se hará efectivo y se facturará a partir del <strong>{formattedDate}</strong>.
                            </p>
                            <button
                                onClick={() => handleAction('change_plan')}
                                disabled={isPending}
                                className="w-full flex justify-center items-center py-3.5 px-6 bg-[var(--ag-sys-color-primary)] text-white rounded-xl font-bold hover:bg-[var(--ag-sys-color-primary-hover)] transition-all disabled:opacity-50"
                            >
                                {isPending ? "Procesando..." : `Confirmar cambio a Plan ${targetPlanName}`}
                            </button>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                            <h3 className="font-bold text-lg text-red-700 mb-2">Cancelar suscripción</h3>
                            <p className="text-red-600/80 text-sm mb-6">
                                Al cancelar, mantendrás los beneficios de tu plan {planType.toUpperCase()} hasta el <strong>{formattedDate}</strong>. 
                                Después, tu cuenta volverá a ser un perfil de usuario normal.
                            </p>
                            <button
                                onClick={() => handleAction('cancel')}
                                disabled={isPending}
                                className="w-full flex justify-center items-center py-3.5 px-6 bg-white border-2 border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50"
                            >
                                {isPending ? "Procesando..." : "Cancelar mi plan"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            {successMessage && (
                <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-4 shadow-sm">
                    <div className="bg-green-100 p-2 rounded-full text-green-600 flex-shrink-0 mt-0.5">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-green-800 font-bold text-lg mb-1">Operación exitosa</h3>
                        <p className="text-green-700">{successMessage}</p>
                    </div>
                </div>
            )}

            <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm overflow-hidden">
                <div className="p-8 bg-[var(--ag-sys-color-primary)] text-white relative overflow-hidden flex items-center justify-between">
                    <Building2 className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10" />
                    <div className="relative z-10 flex-1">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-green-200 mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Suscripción Activa
                        </h3>
                        <h2 className="text-4xl font-black mb-1 drop-shadow-md">Plan {planType.toUpperCase()}</h2>
                        <p className="text-green-100 font-medium opacity-90">Facturación y gestión de cuenta</p>
                    </div>
                </div>
                
                <div className="p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row gap-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex-1">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                Próxima Factura
                            </div>
                            <div className="font-black text-xl text-[var(--ag-sys-color-text)]">
                                {formattedDate}
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-gray-400" />
                                Ciclo
                            </div>
                            <div className="font-black text-xl text-[var(--ag-sys-color-text)]">
                                Mensual
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <button 
                            onClick={() => setIsManaging(true)}
                            className="w-full flex justify-center items-center py-3.5 px-6 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            Gestionar plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
