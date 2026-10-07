"use client";

import React from "react";
import { Info } from "lucide-react";
import { useTranslation } from "@/context/LocaleContext";

export default function AboutPage() {
    const { locale } = useTranslation();
    const isPt = locale === "pt";

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center shrink-0">
                        <Info className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">
                            {isPt ? "Sobre Nós" : "Sobre Nosotros"}
                        </h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-1 font-medium">
                            {isPt ? "A nossa história e valores na Ruralpop" : "Nuestra historia y valores en Ruralpop"}
                        </p>
                    </div>
                </header>

                <div className="prose prose-sm sm:prose-base max-w-none text-[var(--ag-sys-color-text)] leading-relaxed space-y-6">
                    {isPt ? (
                        <>
                            <p>
                                Bem-vindo à <strong>Ruralpop</strong>, o mercado digital definitivo concebido exclusivamente para o setor primário. A nossa plataforma nasce com uma missão clara: ligar de forma direta, segura e transparente agricultores, pecuaristas e profissionais do meio rural de todo o país.
                            </p>

                            <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">A Nossa Visão</h3>
                            <p>
                                Acreditamos que o campo necessita de ferramentas tecnológicas adaptadas à sua realidade quotidiana. A Ruralpop não é um mercado generalista; é um espaço dedicado onde quem procura enfardadeiras, palha, tratores usados ou gado selecionado encontra exatamente o seu interlocutor ideal, sem intermediários abusivos.
                            </p>

                            <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">O que nos diferencia?</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Especialização:</strong> Categorias e subcategorias pensadas por e para as pessoas do campo.</li>
                                <li><strong>Segurança:</strong> Perfis verificados e um sistema de chat em tempo real para negociar com confiança.</li>
                                <li><strong>Simplicidade:</strong> Uma interface moderna e intuitiva, centrada a 100% no produto.</li>
                            </ul>

                            <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">O Futuro</h3>
                            <p>
                                Continuamos a melhorar a Ruralpop semanalmente em contacto direto com os nossos utilizadores para acrescentar novas funcionalidades como pagamentos seguros, alertas e muito mais. Junte-se hoje à comunidade e faça parte do maior ecossistema rural da internet.
                            </p>
                        </>
                    ) : (
                        <>
                            <p>
                                Bienvenido a <strong>Ruralpop</strong>, el mercado digital definitivo diseñado exclusivamente para el sector primario. Nuestra plataforma nace con una misión clara: conectar de forma directa, segura y transparente a agricultores, ganaderos y profesionales del medio rural de toda España.
                            </p>

                            <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">Nuestra Visión</h3>
                            <p>
                                Creemos que el campo necesita herramientas tecnológicas adaptadas a su realidad cotidiana. Ruralpop no es un mercado generalista; es un espacio acotado donde quien busca una empacadora, paja, un tractor de segunda mano o ganado selecto encuentra exactamente a su interlocutor ideal sin intermediarios abusivos.
                            </p>

                            <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">¿Qué nos diferencia?</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Especialización:</strong> Categorías y subcategorías pensadas por y para la gente del campo.</li>
                                <li><strong>Seguridad:</strong> Perfiles verificados y un sistema de chat en tiempo real para negociar en confianza.</li>
                                <li><strong>Sencillez:</strong> Una interfaz moderna pero libre de distracciones, centrada al 100% en el producto.</li>
                            </ul>

                            <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">El Futuro</h3>
                            <p>
                                Seguimos iterando Ruralpop semanalmente en contacto directo con nuestros primeros usuarios para añadir nuevas funcionalidades como pagos seguros, alertas de lonjas y mucho más. Únete hoy a la comunidad y sé parte del mayor ecosistema rural de internet.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Página puramente informativa de "Sobre nosotros", evitando errores de 404.
 * - Diseño usando el standard card/surface de Antigravity.
 */
