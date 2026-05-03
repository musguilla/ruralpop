import Link from "next/link";
import { CheckCircle2, ShoppingBag } from "lucide-react";

export default function EscrowSuccessPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-[var(--ag-sys-color-background)] px-4">
            <div className="max-w-md w-full bg-[var(--ag-sys-color-surface)] rounded-3xl p-8 shadow-xl text-center border border-[var(--ag-sys-color-border)]">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-3">
                    ¡Pago recibido!
                </h1>
                
                <p className="text-[var(--ag-sys-color-text-muted)] mb-8">
                    Tu dinero queda retenido y protegido por Ruralpop. El pago al vendedor solo se liberará cuando confirmes que has recibido el artículo correctamente.
                </p>

                <div className="space-y-4">
                    <Link 
                        href="/dashboard/compras" 
                        className="w-full py-4 px-6 rounded-xl font-bold bg-[var(--ag-sys-color-primary)] text-white hover:bg-[var(--ag-sys-color-primary-hover)] transition-all flex items-center justify-center gap-2"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        Ver mis compras
                    </Link>
                    
                    <Link 
                        href="/" 
                        className="w-full py-4 px-6 rounded-xl font-bold bg-[var(--ag-sys-color-surface-variant)] text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-surface-variant-hover)] transition-all block"
                    >
                        Volver a la portada
                    </Link>
                </div>
            </div>
        </div>
    );
}
