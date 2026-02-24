import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
    session: Session | null | undefined;
    user: User | null | undefined;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    session: undefined,
    user: undefined,
    isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null | undefined>(undefined);
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setIsLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ session, user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
