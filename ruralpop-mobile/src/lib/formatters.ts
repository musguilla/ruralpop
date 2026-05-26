export function formatPrice(price: number | string | null | undefined): string {
    if (price === null || price === undefined || price === '') return 'A consultar';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'A consultar';
    
    // Convert to string with proper decimals
    const isInteger = numPrice % 1 === 0;
    const fixed = isInteger ? numPrice.toFixed(0) : numPrice.toFixed(2);
    
    // Split integer and decimal parts
    const parts = fixed.split('.');
    
    // Add thousands separator using Regex
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Join with comma for decimals
    const formattedNum = parts.join(',');
    
    return `${formattedNum} €`;
}
