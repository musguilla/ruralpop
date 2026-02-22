/**
 * Optimiza una imagen antes de subirla para reducir su peso a KB.
 * Redimensiona si es más ancha de 1200px y aplica compresión JPEG.
 */
export async function optimizeImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // Max width de 1200px manteniendo proporción
                const MAX_WIDTH = 1200;
                if (width > MAX_WIDTH) {
                    height = (MAX_WIDTH / width) * height;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) return reject(new Error("No se pudo crear el contexto de canvas"));

                ctx.drawImage(img, 0, 0, width, height);

                // Exportar como JPEG con calidad 0.7 para optimizar a KB
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Error al comprimir la imagen"));
                        }
                    },
                    "image/jpeg",
                    0.7
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
