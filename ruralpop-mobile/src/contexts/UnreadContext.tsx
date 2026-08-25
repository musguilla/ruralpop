import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface UnreadContextType {
    unreadMessages: number;
    unreadNotifications: number;
    totalUnread: number;
    refreshUnread: () => Promise<void>;
}

const UnreadContext = createContext<UnreadContextType>({
    unreadMessages: 0,
    unreadNotifications: 0,
    totalUnread: 0,
    refreshUnread: async () => {},
});

export function UnreadProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const refreshUnread = async () => {
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
    };

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
    }, [user]);

    return (
        <UnreadContext.Provider value={{
            unreadMessages,
            unreadNotifications,
            totalUnread: unreadMessages + unreadNotifications,
            refreshUnread
        }}>
            {children}
        </UnreadContext.Provider>
    );
}

export const useUnread = () => useContext(UnreadContext);
