import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

    // URLs por defecto (Ruralpop)
    let redirectUrl = 'https://ruralpop.com';

    // Detección de dispositivo
    if (/android/i.test(userAgent)) {
        redirectUrl = 'https://play.google.com/store/apps/details?id=com.ruralpop.app&hl=es';
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        redirectUrl = 'https://apps.apple.com/es/app/ruralpop-vende-y-compra/id6759678666';
    }

    const response = NextResponse.redirect(redirectUrl, 302);
    
    // Evitar caché para que si el usuario comparte el enlace o cambia de dispositivo, funcione bien
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Vary', 'User-Agent');

    return response;
}
