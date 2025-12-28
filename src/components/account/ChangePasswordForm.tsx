"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updatePassword } from "@/app/account/security/actions";

export function ChangePasswordForm() {
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const currentPassword = String(formData.get("currentPassword"));
        const newPassword = String(formData.get("newPassword"));
        const confirmPassword = String(formData.get("confirmPassword"));

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Completa todos los campos");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Las contraseñas nuevas no coinciden");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("La nueva contraseña debe tener al menos 8 caracteres");
            return;
        }

        setLoading(true);
        try {
            await updatePassword(currentPassword, newPassword);
            toast.success("Contraseña actualizada correctamente");
            (e.target as HTMLFormElement).reset();
        } catch (err: any) {
            toast.error(err.message || "Error al actualizar contraseña");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                <input 
                    name="currentPassword"
                    type="password" 
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#12753e] focus:ring-[#12753e] sm:text-sm p-2 border" 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                <input 
                    name="newPassword"
                    type="password" 
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#12753e] focus:ring-[#12753e] sm:text-sm p-2 border" 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                <input 
                    name="confirmPassword"
                    type="password" 
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#12753e] focus:ring-[#12753e] sm:text-sm p-2 border" 
                />
            </div>
            <button 
                type="submit"
                disabled={loading}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
                {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
        </form>
    );
}
