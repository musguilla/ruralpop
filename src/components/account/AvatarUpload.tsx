"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { User, Camera, Loader2 } from "lucide-react";
import { uploadAvatar } from "@/app/account/actions";
import { useNotification } from "@/context/NotificationContext";

import { optimizeImage } from "@/utils/image-optimization";

interface AvatarUploadProps {
    initialAvatarUrl: string;
}

export function AvatarUpload({ initialAvatarUrl }: AvatarUploadProps) {
    const [avatar, setAvatar] = useState(initialAvatarUrl);
    const [isPending, setIsPending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showAlert } = useNotification();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith("image/")) {
            showAlert({ title: "Formato no válido", message: "Solo se permiten imágenes.", type: "error" });
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showAlert({ title: "Archivo muy pesado", message: "La imagen no debe superar los 5MB.", type: "error" });
            return;
        }

        setIsPending(true);
        try {
            // Optimizar la imagen antes de subirla
            const optimizedBlob = await optimizeImage(file);
            const optimizedFile = new File([optimizedBlob], "avatar.webp", { type: "image/webp" });

            const formData = new FormData();
            formData.append("file", optimizedFile);

            const result = await uploadAvatar(formData);
            if (result.success && result.url) {
                setAvatar(result.url);
                showAlert({ title: "Foto actualizada", message: "Tu foto de perfil se ha guardado correctamente.", type: "success" });
            } else {
                showAlert({ title: "Error", message: result.error || "No se ha podido subir la imagen.", type: "error" });
            }
        } catch (e: any) {
            showAlert({ title: "Error", message: "No se ha podido procesar la imagen.", type: "error" });
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setIsPending(false);
        }
    };

    return (
        <div className="flex flex-col items-center sm:items-start gap-4 p-8 border-b border-[var(--ag-sys-color-border)]">
            <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)] sm:mb-2 w-full text-center sm:text-left">Foto de Perfil</h2>

            <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
                {/* Avatar Display */}
                <div className="relative group">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[var(--ag-sys-color-background)] shadow-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                        {avatar ? (
                            <Image src={avatar} alt="Avatar" fill className="object-cover" sizes="112px" />
                        ) : (
                            <User className="w-12 h-12 text-gray-400" />
                        )}

                        {isPending && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPending}
                        className="absolute bottom-0 right-0 p-2 bg-[var(--ag-sys-color-primary)] text-white rounded-full shadow-md hover:scale-105 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ag-sys-color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Cambiar foto de perfil"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                    />
                </div>

                <div className="flex flex-col text-center sm:text-left text-sm text-[var(--ag-sys-color-text-muted)] gap-1">
                    <p className="font-semibold text-[var(--ag-sys-color-text)]">Sube una nueva foto</p>
                    <p>Formatos permitidos: JPG, PNG o WEBP.</p>
                    <p>Tamaño máximo recomendado: 5MB.</p>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se aísla el Upload de avatar en Client Component para manejar el estado isPending y el input nativo.
 * - Soporte adaptativo para Mobile y Desktop.
 * - Validación temprana de peso y MIME a nivel cliente ahorrando BW del servidor.
 */
