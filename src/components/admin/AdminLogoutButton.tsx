"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function AdminLogoutButton() {
    const handleLogout = async () => {
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = "/";
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            window.location.href = "/";
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
        >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
        </button>
    );
}
