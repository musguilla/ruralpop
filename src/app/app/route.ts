import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

    const host = request.headers.get('host') || request.headers.get('x-forwarded-host') || '';
    const isEquipop = host.includes('equipop');

    if (isEquipop) {
        let equipopUrl = 'https://www.equipop.app';
        if (/iphone|ipad|ipod/i.test(userAgent)) {
            equipopUrl = 'https://apps.apple.com/es/app/equipop/id6778118647';
        } else if (/android/i.test(userAgent)) {
            equipopUrl = 'https://play.google.com/store/apps/details?id=com.equipop.app&hl=es';
        }
        const equipopResponse = NextResponse.redirect(equipopUrl, 302);
        equipopResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        equipopResponse.headers.set('Pragma', 'no-cache');
        equipopResponse.headers.set('Expires', '0');
        equipopResponse.headers.set('Vary', 'User-Agent');
        return equipopResponse;
    }

    // URLs por defecto (Ruralpop) - Redirige a la sección de la app en escritorio
    let redirectUrl = 'https://ruralpop.com/#app';

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
