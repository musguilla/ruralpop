import { CheckoutFormClient } from "@/components/checkout/CheckoutForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Finalizar Compra | Tienda Ruralpop",
    description: "Completa tu pedido de forma segura.",
    robots: {
       index: false,
       follow: false
    }
};

export default function CheckoutPage() {
    return (
        <div className="bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen">
            <div className="bg-[var(--ag-sys-color-surface)] border-b border-[var(--ag-sys-color-border)] mb-8">
                <div className="container mx-auto px-4 py-8 md:py-12 text-center text-[var(--ag-sys-color-text)]">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Finalizar Compra</h1>
                    <p className="text-[var(--ag-sys-color-text-muted)]">Estás a un paso de conseguir tus productos Ruralpop</p>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-16">
                <CheckoutFormClient />
            </div>
        </div>
    );
}
