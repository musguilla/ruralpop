"use client";

import React, { useState, useEffect } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ImageUploaderProps {
    onImagesChange: (urls: string[]) => void;
    maxFiles?: number;
}

export function ImageUploader({ onImagesChange, maxFiles = 10 }: ImageUploaderProps) {
    const [files, setFiles] = useState<{ id: string; url: string; uploading: boolean }[]>([]);
    const supabase = createClient();

    // Notificar al componente padre solo cuando las URLs cambien
    useEffect(() => {
        const allUrls = files.filter(f => !f.uploading && f.url).map(f => f.url);
        onImagesChange(allUrls);
    }, [files, onImagesChange]);

    const uploadFile = async (file: File, tempId: string) => {
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `listings/${fileName}`;

            // IMPORTANTE: Asegúrate de que el bucket se llame 'listings' en Supabase
            const { error: uploadError } = await supabase.storage
                .from("listings")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("listings")
                .getPublicUrl(filePath);

            setFiles((prev) =>
                prev.map(f => f.id === tempId ? { ...f, uploading: false, url: publicUrl } : f)
            );
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error al subir la imagen. Verifica que el bucket 'listings' existe y es público.");
            setFiles((prev) => prev.filter(f => f.id !== tempId));
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);

        if (files.length + newFiles.length > maxFiles) {
            alert(`Máximo ${maxFiles} imágenes permitidas`);
            return;
        }

        newFiles.forEach((file) => {
            const tempId = Math.random().toString(36).substring(7);
            setFiles((prev) => [...prev, { id: tempId, url: "", uploading: true }]);
            uploadFile(file, tempId);
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
                            <img src={fileObj.url} alt="Preview" className="w-full h-full object-cover" />
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

