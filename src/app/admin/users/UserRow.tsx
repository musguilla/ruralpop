"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, MapPin, Calendar, Edit2, UserX, Package, X, Save, AlertTriangle } from "lucide-react";
import { formatRelativeTime } from "@/utils/format";
import { LOCATIONS } from "@/constants/locations";
import { updateUser, deleteUser } from "./actions";

interface UserRowProps {
    user: any;
    adsCount: number;
}

export function UserRow({ user, adsCount }: UserRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form states
    const [editName, setEditName] = useState(user.name || "");
    const [editRole, setEditRole] = useState(user.role || "user");
    const [editLocation, setEditLocation] = useState(user.location || "");
    const [editEmail, setEditEmail] = useState(user.email || "");
    const [editPhone, setEditPhone] = useState(user.contact_phone || "");
    const [editProvince, setEditProvince] = useState(user.province_id ? String(user.province_id) : "");
    const [editMunicipality, setEditMunicipality] = useState(user.municipality_id || "");

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateUser(user.id, {
            name: editName,
            role: editRole,
            location: editLocation,
            email: editEmail,
            contact_phone: editPhone,
            province_id: editProvince ? Number(editProvince) : null,
            municipality_id: editMunicipality ? editMunicipality : null
        });
        setIsSaving(false);
        if (res.success) {
            setIsEditing(false);
        } else {
            alert("Error al actualizar: " + res.error);
        }
    };

    const handleDelete = async () => {
        setIsSaving(true);
        const res = await deleteUser(user.id);
        setIsSaving(false);
        if (res.success) {
            setIsDeleting(false);
        } else {
            alert("Error al eliminar: " + res.error);
        }
    };

    return (
        <>
            <tr className="hover:bg-[var(--ag-sys-color-background)]/50 transition-colors group">
                <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="relative w-11 h-11 rounded-xl bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] overflow-hidden flex-shrink-0">
                            {user.avatar_url ? (
                                <Image src={user.avatar_url} alt={user.name || ''} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[var(--ag-sys-color-primary)] font-bold text-lg">
                                    {(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-[var(--ag-sys-color-text)] leading-tight">
                                {user.name || user.email?.split('@')[0] || 'Usuario'}
                            </p>
                            <span className="text-xs text-[var(--ag-sys-color-text-muted)]">{user.email}</span>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-[var(--ag-sys-color-text-muted)] font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        {user.location || 'No definida'}
                    </div>
                </td>
                <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}>
                        {user.role === 'admin' ? <Shield className="w-3 h-3" /> : null}
                        {user.role}
                    </span>
                </td>
                <td className="px-6 py-5">
                    <Link
                        href={`/admin/listings?userId=${user.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ag-sys-color-background)] rounded-lg hover:bg-[var(--ag-sys-color-border)] hover:text-[var(--ag-sys-color-primary)] font-bold transition-colors"
                        title="Ver anuncios del usuario"
                    >
                        <Package className="w-3.5 h-3.5" />
                        {adsCount} {adsCount === 1 ? 'anuncio' : 'anuncios'}
                    </Link>
                </td>
                <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-[var(--ag-sys-color-text-muted)] font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatRelativeTime(user.created_at)}
                    </div>
                </td>
                <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2.5 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-background)] rounded-xl transition-all"
                            title="Editar Datos"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsDeleting(true)}
                            className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Eliminar y Banear Usuario"
                        >
                            <UserX className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-[var(--ag-sys-color-surface)] w-full max-w-md rounded-[2rem] p-6 shadow-xl border border-[var(--ag-sys-color-border)]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-[var(--ag-sys-color-text)]">Editar Usuario</h3>
                            <button onClick={() => setIsEditing(false)} className="text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                            <div>
                                <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Nombre</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="w-full bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Email</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={e => setEditEmail(e.target.value)}
                                    className="w-full bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Teléfono</label>
                                <input
                                    type="text"
                                    value={editPhone}
                                    onChange={e => setEditPhone(e.target.value)}
                                    className="w-full bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/50"
                                    placeholder="Ej. +34 600..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Provincia</label>
                                    <select
                                        value={editProvince}
                                        onChange={e => {
                                            setEditProvince(e.target.value);
                                            setEditMunicipality("");
                                        }}
                                        className="w-full bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/50 appearance-none"
                                    >
                                        <option value="">Cualquiera</option>
                                        {LOCATIONS.filter(l => l.type === 'province').map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Localidad</label>
                                    <select
                                        value={editMunicipality}
                                        onChange={e => setEditMunicipality(e.target.value)}
                                        className="w-full bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/50 appearance-none"
                                        disabled={!editProvince}
                                    >
                                        <option value="">Cualquiera</option>
                                        {LOCATIONS.filter(l => l.type === 'municipality' && (!editProvince || l.province === LOCATIONS.find(prov => prov.id === editProvince)?.name)).map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Ubicación (Texto Libre)</label>
                                <input
                                    type="text"
                                    value={editLocation}
                                    onChange={e => setEditLocation(e.target.value)}
                                    className="w-full bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/50"
                                    placeholder="Ej. Madrid"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Rol</label>
                                <select
                                    value={editRole}
                                    onChange={e => setEditRole(e.target.value)}
                                    className="w-full bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/50 appearance-none"
                                >
                                    <option value="user">Usuario (user)</option>
                                    <option value="admin">Administrador (admin)</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 rounded-xl font-bold text-[var(--ag-sys-color-text)] bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] hover:bg-[var(--ag-sys-color-border)] transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-3 rounded-xl font-bold text-white bg-[var(--ag-sys-color-primary)] hover:opacity-90 transition-colors flex items-center gap-2"
                                >
                                    {isSaving ? "Guardando..." : <><Save className="w-4 h-4" /> Guardar</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-[var(--ag-sys-color-surface)] w-full max-w-sm rounded-[2rem] p-6 shadow-xl border border-[var(--ag-sys-color-border)]">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 mx-auto">
                            <AlertTriangle className="w-6 h-6 outline-none" />
                        </div>
                        <h3 className="text-xl font-black text-center text-[var(--ag-sys-color-text)] mb-2">Eliminar Cuenta</h3>
                        <p className="text-center text-[var(--ag-sys-color-text-muted)] text-sm mb-6 leading-relaxed">
                            Esta acción eliminará permanentemente la cuenta de <span className="font-bold">{user.email}</span>, y borrará en cascada todos sus anuncios en Ruralpop.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={isSaving}
                                className="w-full py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                {isSaving ? "Eliminando..." : "Sí, eliminar cuenta"}
                            </button>
                            <button
                                onClick={() => setIsDeleting(false)}
                                className="w-full py-3 rounded-xl font-bold text-[var(--ag-sys-color-text)] bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] hover:bg-[var(--ag-sys-color-border)] transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
