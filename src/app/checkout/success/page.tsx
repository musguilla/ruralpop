'use client';

import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, Download } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessClientContent() {
  const { clearCart } = useCartStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cleared, setCleared] = useState(false);

  const email = searchParams.get('email') || 'tu correo';
  const paymentIntent = searchParams.get('payment_intent');

  useEffect(() => {
    if (!cleared) {
      clearCart();
      setCleared(true);
      
      // In a real production scenario with Webhooks, we wouldn't need to do anything here.
      // But we can hit an endpoint to trigger our Resend email just in case:
      if (paymentIntent && email) {
         fetch('/api/send-order-email', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, paymentIntent })
         }).catch(console.error);
      }
    }
  }, [clearCart, cleared, email, paymentIntent]);

  return (
    <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-3xl p-8 md:p-12 shadow-sm">
          
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 text-green-600 rounded-full mb-8">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--ag-sys-color-text)] mb-6">
            ¡Pago completado!
          </h1>
          
          <p className="text-lg text-[var(--ag-sys-color-text-muted)] mb-8">
            Tu pedido se ha procesado con éxito. Hemos enviado un resumen de tu compra a <strong className="text-[var(--ag-sys-color-text)]">{email}</strong>.
          </p>

          <div className="bg-[var(--ag-sys-color-background)] p-6 rounded-2xl border border-[var(--ag-sys-color-border)] text-left mb-10">
            <h3 className="font-bold text-[var(--ag-sys-color-text)] mb-2">Siguientes pasos</h3>
            <ul className="space-y-3 text-sm text-[var(--ag-sys-color-text-muted)]">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--ag-sys-color-primary)] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                Preparamos tu paquete en menos de 24 horas laborables.
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--ag-sys-color-primary)] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                Recibirás un SMS/Email de Correos Express con el número de seguimiento.
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--ag-sys-color-primary)] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                Entrega estimada en 48/72 horas en tu domicilio.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/tienda"
              className="bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text)] border border-[var(--ag-sys-color-border)] font-bold py-4 px-8 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Volver a la tienda
            </Link>
            <Link 
              href="/"
              className="bg-[var(--ag-sys-color-primary)] text-white font-bold py-4 px-8 rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-colors flex items-center justify-center gap-2 group"
            >
              Ir a Anuncios <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--ag-sys-color-background)]" />}>
      <SuccessClientContent />
    </Suspense>
  );
}
