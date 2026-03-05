"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({
    id,
    name,
    placeholder = "••••••••",
    required = true,
    minLength,
    autoComplete,
    value,
    onChange
}: {
    id: string;
    name: string;
    placeholder?: string;
    required?: boolean;
    minLength?: number;
    autoComplete?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <input
                id={id}
                name={name}
                type={showPassword ? "text" : "password"}
                autoComplete={autoComplete}
                required={required}
                minLength={minLength}
                value={value}
                onChange={onChange}
                className="appearance-none relative block w-full px-4 py-3 pr-10 border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] focus:border-transparent transition-all sm:text-sm"
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors focus:outline-none"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
                {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                )}
            </button>
        </div>
    );
}
