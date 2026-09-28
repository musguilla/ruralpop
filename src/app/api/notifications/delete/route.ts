import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Endpoint de eliminación segura de notificaciones.
 * Utiliza supabaseAdmin para superar la ausencia de política DELETE en RLS de Supabase.
 */
export async function POST(req: Request) {
    try {
        const body = (await req.json()) as { notificationId?: string; userId?: string };
        const { notificationId, userId } = body;

        if (!notificationId || typeof notificationId !== 'string') {
            return NextResponse.json(
                { error: 'El parámetro notificationId es obligatorio y debe ser una cadena válida.' },
                { status: 400, headers: CORS_HEADERS }
            );
        }

        // Determinar usuario autorizado mediante Bearer Token o userId provisto
        let authenticatedUserId: string | null = userId && typeof userId === 'string' ? userId : null;
        const authHeader = req.headers.get('Authorization');

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.replace('Bearer ', '').trim();
            const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
            if (!authError && authData.user?.id) {
                authenticatedUserId = authData.user.id;
            }
        }

        if (!authenticatedUserId) {
            return NextResponse.json(
                { error: 'No autorizado: no se pudo verificar la identidad del usuario.' },
                { status: 401, headers: CORS_HEADERS }
            );
        }

        // Eliminación física en la tabla notifications filtrada por usuario
        const { error: deleteError } = await supabaseAdmin
            .from('notifications')
            .delete()
            .eq('id', notificationId)
            .eq('user_id', authenticatedUserId);

        if (deleteError) {
            console.error('Error al eliminar notificación con supabaseAdmin:', deleteError);
            return NextResponse.json(
                { error: deleteError.message },
                { status: 500, headers: CORS_HEADERS }
            );
        }

        return NextResponse.json(
            { success: true, deletedId: notificationId },
            { status: 200, headers: CORS_HEADERS }
        );
    } catch (err: unknown) {
        console.error('Error no controlado en POST /api/notifications/delete:', err);
        return NextResponse.json(
            { error: 'Error interno del servidor al procesar la eliminación.' },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: CORS_HEADERS,
    });
}
