/**
 * Calculates the Ruralpop protection fee in cents based on the progressive tiers.
 * 
 * - 0 € – 5 € → 0,40 € fijo (0 - 500 cents -> 40 cents)
 * - 6 € – 10 € → 0,50 € fijo (501 - 1000 cents -> 50 cents)
 * - 11 € – 50 € → 1,50 € fijo (1001 - 5000 cents -> 150 cents)
 * - 51 € – 300 € → 4% (5001 - 30000 cents -> 4%)
 * - 300 € – 1.000 € → 3% (30001 - 100000 cents -> 3%)
 * - 1.000,01 € a 5.000 € → 2,2% (100001 - 500000 cents -> 2.2%)
 * - Más de 5.000 € → 2% (> 500000 cents -> 2%)
 */
export function calculateRuralpopFee(amountCents: number): number {
    if (amountCents <= 500) return 40;
    if (amountCents <= 1000) return 50;
    if (amountCents <= 5000) return 150;
    if (amountCents <= 30000) return Math.round(amountCents * 0.04);
    if (amountCents <= 100000) return Math.round(amountCents * 0.03);
    if (amountCents <= 500000) return Math.round(amountCents * 0.022);
    return Math.round(amountCents * 0.02);
}
