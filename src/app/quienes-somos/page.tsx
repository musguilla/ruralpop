import React from "react";
import { Users, Heart, Target, Globe } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quiénes Somos | Equipop",
    description: "Descubre quiénes somos, nuestra misión y por qué hemos creado el punto de encuentro definitivo para la comunidad ecuestre.",
};

export default function QuienesSomosPage() {
    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-10 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">Quiénes somos</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-2 font-medium text-lg">El punto de encuentro de la comunidad ecuestre</p>
                    </div>
                </header>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-[var(--ag-sys-color-text)] flex items-center gap-3">
                            <Heart className="text-rose-500 w-6 h-6" /> Nuestra Pasión
                        </h2>
                        <p className="text-[var(--ag-sys-color-text-muted)] text-lg leading-relaxed">
                            Equipop nace de la pasión compartida por el mundo del caballo. Sabemos de primera mano lo costoso que puede resultar equiparse adecuadamente, tanto para el jinete como para el caballo, y la cantidad de material que acumulamos en nuestros guadarneses sin darle uso. Decidimos crear la plataforma que siempre quisimos tener.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-[var(--ag-sys-color-text)] flex items-center gap-3">
                            <Target className="text-[var(--ag-sys-color-primary)] w-6 h-6" /> Nuestro Objetivo
                        </h2>
                        <p className="text-[var(--ag-sys-color-text-muted)] text-lg leading-relaxed">
                            Queremos democratizar el acceso a material ecuestre de calidad. Fomentamos la economía circular dando una segunda vida a monturas, botas, cascos y accesorios, permitiendo a jinetes y amazonas de todos los niveles disfrutar de su pasión de manera más asequible y sostenible.
                        </p>
                    </section>

                    <section className="bg-slate-50 dark:bg-slate-900/30 p-8 rounded-2xl border border-[var(--ag-sys-color-border)]">
                        <h2 className="text-2xl font-bold mb-4 text-[var(--ag-sys-color-text)] flex items-center gap-3">
                            <Globe className="text-blue-500 w-6 h-6" /> Una Comunidad Unida
                        </h2>
                        <p className="text-[var(--ag-sys-color-text-muted)] text-lg leading-relaxed mb-0">
                            Más que un mercado, Equipop es una comunidad. Un espacio para conectar, compartir experiencias y fomentar el compañerismo dentro y fuera de la pista. Aquí encontrarás no solo material, sino personas que comparten tu misma pasión y afición por los caballos.
                        </p>
                    </section>
                </div>

            </div>
            {/* 
              Documentación de Memoria:
              - Se implementa una vista corporativa y cercana que transmite los valores de la marca.
              - Iconografía emocional para conectar con el usuario (Heart, Target, Globe, Users).
            */}
        </div>
    );
}
