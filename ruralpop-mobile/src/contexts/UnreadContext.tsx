import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface UnreadContextType {
    unreadMessages: number;
    unreadNotifications: number;
    totalUnread: number;
    refreshUnread: () => Promise<void>;
    decrementUnreadNotification: () => void;
    incrementUnreadNotification: () => void;
}

const UnreadContext = createContext<UnreadContextType>({
    unreadMessages: 0,
    unreadNotifications: 0,
    totalUnread: 0,
    refreshUnread: async () => {},
    decrementUnreadNotification: () => {},
    incrementUnreadNotification: () => {},
});

export function UnreadProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [unreadMessages, setUnreadMessages] = useState<number>(0);
    const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

    const refreshUnread = useCallback(async (): Promise<void> => {
        if (!user) return;
        
        // Fetch unread messages
        const { count: msgCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('is_read', false);
            
        setUnreadMessages(msgCount || 0);

        // Fetch unread notifications
        const { count: notifCount } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
            
        setUnreadNotifications(notifCount || 0);
    }, [user]);

    /**
     * Decrementa optimísticamente en 1 el contador de notificaciones no leídas
     * para reflejo inmediato en el badge globo sin esperar respuesta de red.
     */
    const decrementUnreadNotification = useCallback((): void => {
        setUnreadNotifications(prev => Math.max(0, prev - 1));
    }, []);

    /**
     * Incrementa en 1 el contador de notificaciones no leídas si el usuario
     * pulsa "Deshacer" dentro del margen de 5 segundos.
     */
    const incrementUnreadNotification = useCallback((): void => {
        setUnreadNotifications(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (!user) {
            setUnreadMessages(0);
            setUnreadNotifications(0);
            return;
        }

        refreshUnread();

        // Subscribe to messages changes
        const msgChannel = supabase
            .channel(`unread_messages_${user.id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
                () => { refreshUnread(); }
            )
            .subscribe();

        // Subscribe to notifications changes
        const notifChannel = supabase
            .channel(`unread_notifications_${user.id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                () => { refreshUnread(); }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(msgChannel);
            supabase.removeChannel(notifChannel);
        };
    }, [user, refreshUnread]);

    return (
        <UnreadContext.Provider value={{
            unreadMessages,
            unreadNotifications,
            totalUnread: unreadMessages + unreadNotifications,
            refreshUnread,
            decrementUnreadNotification,
            incrementUnreadNotification,
        }}>
            {children}
        </UnreadContext.Provider>
    );
}

export const useUnread = () => useContext(UnreadContext);

// ============================================================================
// Documentación de Memoria y Decisiones Técnicas (RULE[user_global])
// ============================================================================
/**
 * Decisiones Técnicas:
 * 1. Decremento / Incremento Optimista:
 *    - Se proveen `decrementUnreadNotification` e `incrementUnreadNotification` para que el badge globo
 *      de las pestañas y barra de navegación se actualice en tiempo real (0 ms de latencia) al realizar
 *      acciones destructivas o restauraciones de notificaciones no leídas.
 * 2. Type Safety y Reglas de Hooks:
 *    - Uso estricto de tipos TypeScript sin 'any'.
 *    - Todas las funciones callback (`refreshUnread`, `decrementUnreadNotification`, `incrementUnreadNotification`)
 *      están estabilizadas con `useCallback` en el nivel superior del componente provider.
 */
