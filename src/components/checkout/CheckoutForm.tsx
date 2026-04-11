'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Load Stripe (ensure env var exists)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function PaymentForm({ clientSecret, totalAmount, customerEmail, shippingDetails }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    // Call API or Resend manually if we want to send order email here,
    // or rely on the success page to do it.

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?email=${encodeURIComponent(customerEmail)}`,
        payment_method_data: {
          billing_details: {
            name: shippingDetails.name,
            email: shippingDetails.email,
          }
        }
      },
    });

    if (error) {
      setErrorMessage(error.message || 'Ha ocurrido un error al procesar el pago.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[var(--ag-sys-color-background)] p-4 rounded-xl border border-[var(--ag-sys-color-border)]">
        <PaymentElement />
      </div>
      
      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold">
          {errorMessage}
        </div>
      )}

      <button
        disabled={isProcessing || !stripe || !elements}
        className="w-full flex justify-center items-center py-4 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Procesando pago...' : `Pagar ${totalAmount.toFixed(2)}€`}
      </button>

      <p className="text-xs text-center text-[var(--ag-sys-color-text-muted)] mt-4 flex justify-center items-center gap-1.5">
        <ShieldCheck className="w-4 h-4" /> Pagos cifrados por Stripe
      </p>
    </form>
  );
}

export function CheckoutFormClient() {
  const { items, getCartTotal } = useCartStore();
  const router = useRouter();
  
  const [clientSecret, setClientSecret] = useState('');
  const [paymentTotal, setPaymentTotal] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    province: ''
  });

  const [isReadyToPay, setIsReadyToPay] = useState(false);
  const [isLoadingSecret, setIsLoadingSecret] = useState(false);

  // Redirigir si no hay items
  useEffect(() => {
    if (items.length === 0 && !isReadyToPay) {
      router.push('/tienda');
    }
  }, [items, router, isReadyToPay]);

  const cartTotal = getCartTotal();
  const shippingCost = 5.50;
  const finalTotal = cartTotal + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContinueToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingSecret(true);

    try {
      const res = await fetch('/api/create-store-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items,
          shippingDetails: formData
        })
      });

      if (!res.ok) throw new Error('Error al inicializar el pago');

      const data = await res.json();
      setClientSecret(data.clientSecret);
      setPaymentTotal(data.totalAmount);
      setIsReadyToPay(true);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsLoadingSecret(false);
    }
  };

  if (items.length === 0 && !isReadyToPay) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto py-8">
      
      {/* Columna Izquierda: Formulario / Pago */}
      <div className="lg:col-span-7 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-3xl p-6 sm:p-8">
        
        {!isReadyToPay ? (
           <>
            <div className="mb-6 pb-6 border-b border-[var(--ag-sys-color-border)]">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Truck className="w-6 h-6 text-[var(--ag-sys-color-primary)]" />
                Datos de Envío
              </h2>
            </div>

            <form onSubmit={handleContinueToPayment} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input required name="name" placeholder="Nombre completo" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]" />
                <input required type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]" />
              </div>
              
              <input required name="phone" placeholder="Teléfono de contacto" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]" />
              
              <input required name="address" placeholder="Dirección completa (Calle, número, piso)" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]" />
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <input required name="zip" placeholder="Código Postal" value={formData.zip} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]" />
                <input required name="city" placeholder="Población" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]" />
                <input required name="province" placeholder="Provincia" value={formData.province} onChange={handleInputChange} className="col-span-2 md:col-span-1 w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]" />
              </div>

              <button 
                type="submit"
                disabled={isLoadingSecret}
                className="w-full mt-6 py-4 bg-[var(--ag-sys-color-text)] text-[var(--ag-sys-color-surface)] font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoadingSecret ? 'Generando plataforma de pago...' : 'Continuar al pago'}
              </button>
            </form>
           </>
        ) : (
           <>
            <div className="mb-6 pb-6 border-b border-[var(--ag-sys-color-border)] flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-[var(--ag-sys-color-primary)]" />
                Pago Seguro
              </h2>
              <button 
                onClick={() => setIsReadyToPay(false)}
                className="text-sm font-semibold text-[var(--ag-sys-color-primary)] hover:underline"
              >
                Volver a envíos
              </button>
            </div>

            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                <PaymentForm 
                  clientSecret={clientSecret} 
                  totalAmount={paymentTotal || finalTotal} 
                  customerEmail={formData.email}
                  shippingDetails={formData} 
                />
              </Elements>
            )}
           </>
        )}

      </div>

      {/* Columna Derecha: Resumen Carrito */}
      <div className="lg:col-span-5 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-3xl p-6 sm:p-8">
        <h3 className="text-xl font-bold mb-6">Resumen de tu compra</h3>
        
        <div className="space-y-4 mb-6">
          {items.map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden relative">
                   <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full" />
                </div>
                <span className="font-semibold">{item.quantity}x {item.title}</span>
              </div>
              <span className="font-bold">{(item.price * item.quantity).toFixed(2)}€</span>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--ag-sys-color-border)] pt-4 space-y-3">
          <div className="flex justify-between text-sm text-[var(--ag-sys-color-text-muted)]">
            <span>Subtotal de productos</span>
            <span>{cartTotal.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-sm text-[var(--ag-sys-color-text-muted)]">
            <span>Gastos de envío (Península)</span>
            <span>{shippingCost.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-xl font-extrabold pt-2 mt-2 border-t border-[var(--ag-sys-color-border)]">
            <span>Total</span>
            <span>{finalTotal.toFixed(2)}€</span>
          </div>
        </div>
      </div>

    </div>
  );
}
