"use client";

import React, { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ImageUploaderProps {
    onImagesChange: (urls: string[]) => void;
    maxFiles?: number;
}

export function ImageUploader({ onImagesChange, maxFiles = 10 }: ImageUploaderProps) {
    const [files, setFiles] = useState<{ file: File; url: string; uploading: boolean }[]>([]);
    const supabase = createClient();

    const uploadFile = async (file: File, index: number) => {
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `listings/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("listing-images")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("listing-images")
                .getPublicUrl(filePath);

            setFiles((prev) => {
                const newFiles = [...prev];
                newFiles[index] = { ...newFiles[index], uploading: false, url: publicUrl };
                const allUrls = newFiles.filter(f => f.url).map(f => f.url);
                onImagesChange(allUrls);
                return newFiles;
            });
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error al subir la imagen");
            removeFile(index);
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);

        if (files.length + newFiles.length > maxFiles) {
            alert(`Máximo ${maxFiles} imágenes permitidas`);
            return;
        }

        const startIdx = files.length;
        const incoming = newFiles.map((file) => {
            const localUrl = URL.createObjectURL(file);
            return { file, url: "", uploading: true, localUrl };
        });

        setFiles((prev) => [...prev, ...incoming.map(f => ({ file: f.file, url: "", uploading: true }))]);

        newFiles.forEach((file, i) => {
            uploadFile(file, startIdx + i);
        });
    };

    const removeFile = (index: number) => {
        setFiles((prev) => {
            const filtered = prev.filter((_, i) => i !== index);
            onImagesChange(filtered.filter(f => f.url).map(f => f.url));
            return filtered;
        });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {files.map((fileObj, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] group">
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
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 hover:bg-white transition-opacity"
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
                Sube hasta {maxFiles} fotos. La primera será la imagen principal.
            </p>
        </div>
    );
}
