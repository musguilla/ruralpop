"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from "lucide-react";

type AlertType = "success" | "error" | "info" | "warning";

interface AlertOptions {
    title: string;
    message: string;
    type?: AlertType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface NotificationContextType {
    showAlert: (options: AlertOptions) => void;
    showConfirm: (options: AlertOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<AlertOptions | null>(null);
    const [isConfirm, setIsConfirm] = useState(false);

    const showAlert = (opts: AlertOptions) => {
        setOptions(opts);
        setIsConfirm(false);
        setIsOpen(true);
    };

    const showConfirm = (opts: AlertOptions) => {
        setOptions(opts);
        setIsConfirm(true);
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        options?.onCancel?.();
    };

    const handleConfirm = () => {
        setIsOpen(false);
        options?.onConfirm?.();
    };

    return (
        <NotificationContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            {isOpen && options && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--ag-sys-color-surface)] w-full max-w-md rounded-[2.5rem] shadow-2xl border border-[var(--ag-sys-color-border)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${options.type === "error" ? "bg-red-50 text-red-600" :
                                        options.type === "success" ? "bg-green-50 text-green-600" :
                                            options.type === "warning" ? "bg-amber-50 text-amber-600" :
                                                "bg-blue-50 text-blue-600"
                                    }`}>
                                    {options.type === "error" && <XCircle className="w-8 h-8" />}
                                    {options.type === "success" && <CheckCircle2 className="w-8 h-8" />}
                                    {options.type === "warning" && <AlertTriangle className="w-8 h-8" />}
                                    {(options.type === "info" || !options.type) && <Info className="w-8 h-8" />}
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-[var(--ag-sys-color-background)] rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-[var(--ag-sys-color-text-muted)]" />
                                </button>
                            </div>

                            <h3 className="text-xl font-extrabold text-[var(--ag-sys-color-text)] mb-2">
                                {options.title}
                            </h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed font-medium">
                                {options.message}
                            </p>
                        </div>

                        <div className="p-6 bg-[var(--ag-sys-color-background)]/50 border-t border-[var(--ag-sys-color-border)] flex gap-3">
                            {isConfirm && (
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-3.5 px-6 rounded-2xl border border-[var(--ag-sys-color-border)] text-sm font-bold text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-surface)] transition-all active:scale-95"
                                >
                                    {options.cancelText || "Cancelar"}
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 py-3.5 px-6 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg ${options.type === "error" ? "bg-red-600 shadow-red-200" :
                                        options.type === "success" ? "bg-green-600 shadow-green-200" :
                                            "bg-[var(--ag-sys-color-primary)] shadow-[var(--ag-sys-color-primary)]/20"
                                    }`}
                            >
                                {options.confirmText || (isConfirm ? "Confirmar" : "Entendido")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
}
