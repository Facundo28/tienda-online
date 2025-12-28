"use client";

import { adminUpdateCompany } from "../actions";
import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

export function CompanyEditForm({ company }: { company: any }) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const data = {
            name: formData.get("name") as string,
            cuit: formData.get("cuit") as string,
            phone: formData.get("phone") as string,
        };

        try {
            await adminUpdateCompany(company.id, data);
            toast.success("Empresa actualizada correctamente");
        } catch (e) {
            toast.error("Error al actualizar empresa");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Nombre de Fantasía</label>
                    <input 
                        name="name" 
                        defaultValue={company.name} 
                        className="w-full border border-gray-300 rounded-lg p-2 font-medium" 
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">CUIT</label>
                    <input 
                        name="cuit" 
                        defaultValue={company.cuit} 
                        className="w-full border border-gray-300 rounded-lg p-2 font-mono" 
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Teléfono de Contacto</label>
                    <input 
                        name="phone" 
                        defaultValue={company.phone} 
                        className="w-full border border-gray-300 rounded-lg p-2" 
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <button 
                    disabled={loading}
                    className="bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
            </div>
        </form>
    );
}
