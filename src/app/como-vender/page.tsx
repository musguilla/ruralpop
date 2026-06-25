import React from "react";
import { Tag, Camera, Edit3, Send, CheckCircle2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "¿Cómo vender? | Equipop",
    description: "Aprende a publicar tus anuncios y vender el material ecuestre que ya no utilizas en Equipop.",
};

export default function ComoVenderPage() {
    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-10 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-14 h-14 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center shrink-0">
                        <Tag className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">¿Cómo vender?</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-2 font-medium text-lg">Dales una segunda vida a tus cosas y gana dinero</p>
                    </div>
                </header>

                <div className="space-y-10">
                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xl">
                            1
                        </div>
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-[var(--ag-sys-color-text)]">
                                <Camera className="w-5 h-5 text-blue-600" />
                                Haz buenas fotos
                            </h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                                Una imagen vale más que mil palabras. Asegúrate de tener buena iluminación y muestra diferentes ángulos de tu silla, botas o accesorios. ¡Muestra los detalles para que los compradores confíen!
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xl">
                            2
                        </div>
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-[var(--ag-sys-color-text)]">
                                <Edit3 className="w-5 h-5 text-blue-600" />
                                Añade los detalles
                            </h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                                Tómate un momento para poner un título claro, una descripción sincera indicando posibles marcas de uso, y elige un precio justo. Recuerda especificar la talla, el color y la marca.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xl">
                            3
                        </div>
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-[var(--ag-sys-color-text)]">
                                <Send className="w-5 h-5 text-blue-600" />
                                Prepara el paquete
                            </h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                                Una vez que recibas una oferta y la aceptes a través del Pago Seguro, envuelve el artículo cuidadosamente para protegerlo. Descarga la etiqueta, pégala en la caja y llévalo a tu oficina de envíos más cercana.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xl">
                            4
                        </div>
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-[var(--ag-sys-color-text)]">
                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                Recibe tu dinero
                            </h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                                Cuando el comprador reciba su paquete y compruebe que todo está perfecto, te transferiremos el dinero directamente a tu saldo, desde donde podrás enviarlo a tu cuenta bancaria. ¡Sin complicaciones!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 text-center border border-blue-100 dark:border-blue-900/30">
                    <h3 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-4">¿Listo para hacer hueco en tu guadarnés?</h3>
                    <p className="text-[var(--ag-sys-color-text-muted)] mb-6 max-w-xl mx-auto">Publica tu primer anuncio en menos de 2 minutos y llega a miles de jinetes y amazonas en toda España.</p>
                    <a href="/upload" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors">
                        Subir anuncio ahora
                    </a>
                </div>

            </div>
            {/* 
              Documentación de Memoria:
              - Se implementa una vista atractiva para el flujo de ventas con un color temático ligeramente azul/primario.
              - Iconos temáticos orientados a vendedores.
            */}
        </div>
    );
}
