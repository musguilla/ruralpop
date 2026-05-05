export function formatPrice(price: number | string | null | undefined): string {
    if (price === null || price === undefined || price === '') return 'A consultar';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'A consultar';
    const isInteger = numPrice % 1 === 0;
    
    return new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'EUR', 
        minimumFractionDigits: isInteger ? 0 : 2, 
        maximumFractionDigits: 2 
    }).format(numPrice);
}
