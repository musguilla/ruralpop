"use client";

import React, { useState, useEffect } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { optimizeImage } from "@/utils/image-optimization";
import { useNotification } from "@/context/NotificationContext";

interface ImageUploaderProps {
    onImagesChange: (urls: string[]) => void;
    maxFiles?: number;
    initialImages?: string[];
    onUploadingStateChange?: (isUploading: boolean) => void;
}

export function ImageUploader({ onImagesChange, maxFiles = 10, initialImages = [], onUploadingStateChange }: ImageUploaderProps) {
    const { showAlert } = useNotification();
    const [files, setFiles] = useState<{ id: string; url: string; preview?: string; uploading: boolean }[]>(() => {
        return initialImages.map(url => ({
            id: Math.random().toString(36).substring(7),
            url,
            preview: url, // Initial images use their real url as preview
            uploading: false
        }));
    });
    const supabase = createClient();

    // Notificar al componente padre solo cuando las URLs cambien
    useEffect(() => {
        // En onImagesChange filtramos la db por url global, NO por preview local!
        const allUrls = files.filter(f => !f.uploading && f.url).map(f => f.url);
        onImagesChange(allUrls);
        
        const isUploading = files.some(f => f.uploading);
        if (onUploadingStateChange) {
            onUploadingStateChange(isUploading);
        } else {
            // Fallback robusto para bloquear sumisión de formularios si el padre no implementa la prop
            const form = document.querySelector('form');
            if (form) {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    if (isUploading) {
                        submitBtn.setAttribute('disabled', 'true');
                    } else {
                        submitBtn.removeAttribute('disabled');
                    }
                }
            }
        }
    }, [files, onImagesChange, onUploadingStateChange]);

    const uploadFile = async (file: File, tempId: string, localPreview: string) => {
        try {
            // Optimizar imagen antes de subir (Redimensionar y comprimir)
            console.log(`📸 Optimizando imagen original: ${(file.size / 1024).toFixed(2)} KB`);
            const optimizedBlob = await optimizeImage(file);
            console.log(`✅ Imagen optimizada: ${(optimizedBlob.size / 1024).toFixed(2)} KB`);

            const fileExt = "webp"; // Usamos webp tras la optimización ultra
            const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            // 1. Obtener la URL pre-firmada desde nuestro backend
            const presignRes = await fetch("/api/upload/presign", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    filename: fileName,
                    contentType: "image/webp",
                    folder: "listings",
                }),
            });

            if (!presignRes.ok) {
                 const errText = await presignRes.text();
                 throw new Error(`Error en pre-firma: ${errText}`);
            }

            const { presignedUrl, publicUrl } = await presignRes.json();

            // 2. Subir el binario directamente a Cloudflare R2 usando la url pre-firmada
            const uploadRes = await fetch(presignedUrl, {
                method: "PUT",
                body: optimizedBlob,
                headers: {
                    "Content-Type": "image/webp",
                },
            });

            if (!uploadRes.ok) {
                const errText = await uploadRes.text();
                throw new Error(`Error subiendo a R2: ${errText}`);
            }

            // 3. ¡Éxito! Actualizamos el estado con la public URL para que onImagesChange la lea, pero mantenemos localPreview!
            setFiles((prev) =>
                prev.map(f => f.id === tempId ? { ...f, uploading: false, url: publicUrl, preview: localPreview } : f)
            );
        } catch (error) {
            console.error("Error uploading image:", error);
            showAlert({
                title: "Error de subida",
                message: "No se ha podido subir la imagen. Inténtalo con un archivo más pequeño o de otro formato.",
                type: "error"
            });
            setFiles((prev) => prev.filter(f => f.id !== tempId));
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);

        if (files.length + newFiles.length > maxFiles) {
            showAlert({
                title: "Límite alcanzado",
                message: `Solo puedes subir un máximo de ${maxFiles} imágenes por anuncio.`,
                type: "warning"
            });
            return;
        }

        newFiles.forEach((file) => {
            const tempId = Math.random().toString(36).substring(7);
            const localPreview = URL.createObjectURL(file); // Generar preview ultra-rápida nativa
            setFiles((prev) => [...prev, { id: tempId, url: "", preview: localPreview, uploading: true }]);
            uploadFile(file, tempId, localPreview);
        });
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {files.map((fileObj) => (
                    <div key={fileObj.id} className="relative aspect-square rounded-xl overflow-hidden bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] group">
                        {fileObj.uploading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5">
                                <Loader2 className="w-6 h-6 animate-spin text-[var(--ag-sys-color-primary)]" />
                                <span className="text-[10px] mt-1 font-medium text-[var(--ag-sys-color-text-muted)]">Subiendo...</span>
                            </div>
                        ) : (
                            <img src={fileObj.preview || fileObj.url} alt="Preview" className="w-full h-full object-cover" />
                        )}
                        <button
                            type="button"
                            onClick={() => removeFile(fileObj.id)}
                            className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 hover:bg-white transition-opacity shadow-sm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {files.length < maxFiles && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-[var(--ag-sys-color-border)] hover:border-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-primary)]/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                        <input type="file" multiple accept="image/*" onChange={onFileChange} className="hidden" />
                        <Upload className="w-6 h-6 text-[var(--ag-sys-color-text-muted)] group-hover:text-[var(--ag-sys-color-primary)]" />
                        <span className="text-[10px] font-medium text-[var(--ag-sys-color-text-muted)] group-hover:text-[var(--ag-sys-color-primary)]">Añadir Fotos</span>
                    </label>
                )}
            </div>
            <p className="text-xs text-[var(--ag-sys-color-text-muted)]">
                Sube hasta {maxFiles} fotos. La primera será la principal.
            </p>
        </div>
    );
}

