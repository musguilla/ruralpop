"use client";

import React from "react";
import { FileText } from "lucide-react";
import { useTranslation } from "@/context/LocaleContext";

export default function TermsPage() {
    const { locale } = useTranslation();
    const isPt = locale === 'pt';

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">
                            {isPt ? "Termos e Condições" : "Términos y Condiciones"}
                        </h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-1 font-medium">
                            {isPt ? "Condições de utilização do Ruralpop" : "Condiciones de uso de Ruralpop"}
                        </p>
                    </div>
                </header>

                <div className="prose prose-sm sm:prose-base max-w-none text-[var(--ag-sys-color-text)] leading-relaxed space-y-6">
                    <p>
                        {isPt ? (
                            <>Estes Termos e Condições regulam a utilização da plataforma <strong>Ruralpop</strong>. Ao criar uma conta e utilizar os nossos serviços, aceita cumprir integralmente estas condições.</>
                        ) : (
                            <>Estos Términos y Condiciones regulan el uso de la plataforma <strong>Ruralpop</strong>. Al crear una cuenta y utilizar nuestros servicios, aceptas cumplir con estas condiciones en su totalidad.</>
                        )}
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">
                        {isPt ? "1. Utilização do Serviço" : "1. Uso del Servicio"}
                    </h3>
                    <p>
                        {isPt
                            ? "O Ruralpop funciona como uma plataforma de contacto (portal de anúncios classificados). Não participamos diretamente nas transações de compra e venda entre os utilizadores, nem somos responsáveis pelo estado, legalidade ou qualidade dos bens anunciados. Qualquer acordo é celebrado sob a estrita responsabilidade do vendedor e do comprador."
                            : "Ruralpop funciona como una plataforma de contacto (tablón de anuncios clasificados). No participamos directamente en las transacciones de compra/venta entre los usuarios, ni somos responsables del estado, legalidad o calidad de los bienes anunciados. Todo acuerdo se realiza bajo la estricta responsabilidad del vendedor y el comprador."
                        }
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">
                        {isPt ? "2. Anúncios e Conteúdo" : "2. Anuncios y Contenido"}
                    </h3>
                    <p>
                        {isPt ? "Ao publicar um anúncio, garante que:" : "Al publicar un anuncio, usted garantiza que:"}
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        {isPt ? (
                            <>
                                <li>É o legítimo proprietário ou está devidamente autorizado a vender o artigo ou animal.</li>
                                <li>As fotografias e descrições são verdadeiras e correspondem ao estado atual do artigo.</li>
                                <li>Cumpre toda a legislação em vigor, prestando especial atenção às normas de rastreabilidade e bem-estar animal (guias de circulação pecuária, boletins e registos oficiais).</li>
                                <li>Não publicará artigos ou serviços proibidos pela lei.</li>
                            </>
                        ) : (
                            <>
                                <li>Es propietario legítimo o está debidamente autorizado para vender el artículo o animal.</li>
                                <li>Las fotografías y descripciones son veraces y corresponden al estado actual del artículo.</li>
                                <li>Cumple con toda la legalidad vigente autonómica y nacional, prestando especial atención a la normativa de trazabilidad y bienestar animal (guías ganaderas, cartillas, REGA).</li>
                                <li>No publicará artículos prohibidos por la ley.</li>
                            </>
                        )}
                    </ul>
                    <p>
                        {isPt
                            ? "Reservamo-nos o direito de remover automaticamente conteúdos que consideremos inadequados ou fraudulentos, em defesa e segurança da nossa comunidade."
                            : "Nos reservamos el derecho de eliminar automáticamente contenido que consideremos inapropiado o fraudulento en protección de nuestra comunidad."
                        }
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">
                        {isPt ? "3. Responsabilidades" : "3. Responsabilidades"}
                    </h3>
                    <p>
                        {isPt
                            ? "O Ruralpop não se responsabiliza por eventuais litígios resultantes de transações entre utilizadores, ficando excluído de quaisquer indemnizações decorrentes de artigos defeituosos, pagamentos em falta ou fraudes. Recomendamos vivamente aos utilizadores que utilizem o bom senso, verifiquem presencialmente a maquinaria ou os animais e nunca enviem dinheiro antecipadamente sem garantias."
                            : "Ruralpop no se hace responsable de las disputas generadas en transacciones entre usuarios y queda excluida de indemnizaciones derivadas por artículos defectuosos, pagos incompletos o fraudes. Instamos a los usuarios a usar el sentido común, revisar presencialmente máquinas/ganado y no enviar dinero por adelantado sin garantías."
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Página de términos y condiciones creada para resolver el 404 del footer.
 * - Basada en las directrices de responsabilidad neutra de plataformas C2C.
 */
