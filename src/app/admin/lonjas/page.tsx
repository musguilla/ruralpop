import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { LonjasClient } from './LonjasClient';

export default async function AdminLonjasPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: sources, error } = await supabase
        .from('market_sources')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error loading market sources:', error);
    }

    return (
        <div className="p-6 max-w-6xl mx-auto w-full">
            <LonjasClient sources={sources || []} />
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Server component para delegar la carga de base de datos de manera segura y proteger la ruta.
 */
