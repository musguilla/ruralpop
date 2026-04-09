export function formatPrice(price: number | string | null | undefined): string {
    if (price === null || price === undefined || price === '') return 'A consultar';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'A consultar';
    return new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'EUR', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
    }).format(numPrice);
}
