"use client";

import { useState, useRef, useEffect } from "react";
import { XCircle, Loader2, Mail, Trash2 } from "lucide-react";
import { deleteListing, deleteListingAndSendEmail } from "./actions";
import { useNotification } from "@/context/NotificationContext";

interface DeleteButtonProps {
    listingId: string;
    title: string;
    sellerEmail?: string;
    iconOnly?: boolean;
}

export function DeleteButton({ listingId, title, sellerEmail, iconOnly }: DeleteButtonProps) {
    const { showAlert, showConfirm } = useNotification();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDeleteOnly = () => {
        setIsOpen(false);
        showConfirm({
            title: "¿Borrar permanentemente?",
            message: `Vas a eliminar el anuncio "${title}". Esta acción es irreversible y borrará todas las imágenes del servidor. No se enviará ningún aviso al vendedor.`,
            type: "error",
            confirmText: "Sí, borrar",
            cancelText: "No, cancelar",
            onConfirm: async () => {
                setIsDeleting(true);
                try {
                    const result = await deleteListing(listingId);
                    if (!result.success) {
                        showAlert({
                            title: "Error de moderación",
                            message: result.error || "No se ha podido borrar el anuncio.",
                            type: "error"
                        });
                    }
                } catch (error) {
                    console.error(error);
                    showAlert({
                        title: "Error de conexión",
                        message: "Hubo un fallo al intentar contactar con el servidor.",
                        type: "error"
                    });
                } finally {
                    setIsDeleting(false);
                }
            }
        });
    };

    const handleSendEmailAndDelete = async (reason: 'no_aplica' | 'bienestar_animal') => {
        setShowEmailModal(false);
        if (!sellerEmail) {
            showAlert({ title: "Error", message: "Este usuario no tiene email registrado.", type: "error" });
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteListingAndSendEmail(listingId, sellerEmail, reason);
            if (!result.success) {
                showAlert({
                    title: "Error",
                    message: result.error || "No se pudo borrar o notificar al anuncio.",
                    type: "error"
                });
            } else {
                showAlert({
                    title: "Anuncio eliminado y notificado",
                    message: "El anuncio ha sido borrado y el email ha sido enviado con éxito al vendedor.",
                    type: "success"
                });
            }
        } catch (error) {
            console.error(error);
            showAlert({
                title: "Error",
                message: "Hubo un fallo en la conexión.",
                type: "error"
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isDeleting}
                title="Borrar anuncio"
                className={`flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    iconOnly 
                    ? "w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 border border-red-100" 
                    : "gap-2 px-4 py-2 bg-red-500/10 text-red-500 text-xs font-bold rounded-xl hover:bg-red-500/20"
                }`}
            >
                {isDeleting ? (
                    <Loader2 className={`${iconOnly ? "w-4 h-4" : "w-3.5 h-3.5"} animate-spin`} />
                ) : (
                    <XCircle className={iconOnly ? "w-4 h-4" : "w-3.5 h-3.5"} />
                )}
                {!iconOnly && (isDeleting ? "Procesando..." : "Borrar")}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu">
                        <button
                            onClick={handleDeleteOnly}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            role="menuitem"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar sin más
                        </button>
                        <button
                            onClick={() => { setIsOpen(false); setShowEmailModal(true); }}
                            disabled={!sellerEmail}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            role="menuitem"
                            title={!sellerEmail ? "Este usuario no tiene email" : ""}
                        >
                            <Mail className="w-4 h-4" />
                            Eliminar y avisar
                        </button>
                    </div>
                </div>
            )}

            {showEmailModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-2">Selecciona el motivo del rechazo</h3>
                        <p className="text-sm text-gray-500 mb-6">Se enviará un email al usuario ({sellerEmail}) y se eliminará el anuncio de forma irreversible.</p>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => handleSendEmailAndDelete('no_aplica')}
                                className="w-full text-left px-5 py-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                            >
                                <div className="font-bold text-gray-900 group-hover:text-blue-700">No aplica a Ruralpop</div>
                                <div className="text-xs text-gray-500 mt-1">Plantilla: "No encaja en las categorías y temática principal de la plataforma..."</div>
                            </button>

                            <button
                                onClick={() => handleSendEmailAndDelete('bienestar_animal')}
                                className="w-full text-left px-5 py-4 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all group"
                            >
                                <div className="font-bold text-gray-900 group-hover:text-red-700">Ley Bienestar Animal</div>
                                <div className="text-xs text-gray-500 mt-1">Plantilla: "Ley 7/2023 prohíbe la venta de animales de compañía..."</div>
                            </button>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
