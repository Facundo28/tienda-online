"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AddressFormProps {
  initialData: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    addressInstructions?: string;
    addressType?: string;
    name?: string;
    phone?: string;
  };
  userId: string;
  updateAction: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

const PROVINCES = [
  "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", 
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", 
  "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", 
  "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
];

export function AddressForm({ initialData, updateAction, onCancel }: AddressFormProps) {
  const [instructions, setInstructions] = useState(initialData.addressInstructions || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await updateAction(formData);
      toast.success("Domicilio guardado correctamente");
    } catch (err) {
      toast.error("Error al guardar el domicilio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-gray-900">Nuevo domicilio</h2>
        <button type="button" className="mt-2 text-[#12753e] font-medium text-sm flex items-center gap-1 hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
             <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
             <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          Usar mi ubicación
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Address & No Number */}
        <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-500">Dirección o lugar de entrega</label>
            <input 
                name="street" 
                defaultValue={initialData.addressLine1} 
                className="w-full rounded-md border-gray-300 border px-3 py-2.5 text-sm focus:border-[#12753e] focus:ring-[#12753e] outline-none" // Updated styling
                placeholder="Ej: Avenida los leones 4563"
                required
            />
            <div className="flex items-center gap-2 mt-1">
                <input type="checkbox" id="no-number" className="rounded border-gray-300 text-[#12753e] focus:ring-[#12753e]" />
                <label htmlFor="no-number" className="text-sm text-gray-600">Mi calle no tiene número</label>
            </div>
        </div>

         {/* Zip & City Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                 <label className="block text-xs font-medium text-gray-500">Código Postal</label>
                 <div className="relative">
                    <input 
                        name="zip" 
                        defaultValue={initialData.postalCode} 
                        className="w-full rounded-md border-gray-300 border px-3 py-2.5 text-sm focus:border-[#12753e] focus:ring-[#12753e] outline-none"
                        placeholder="Ej: 1425"
                        required
                    />
                    <button type="button" className="absolute right-3 top-2.5 text-xs text-[#12753e] font-medium hover:underline">
                        No sé mi CP
                    </button>
                 </div>
            </div>
             <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Provincia</label>
                <select 
                    name="state" 
                    defaultValue={initialData.state || ""} 
                    className="w-full rounded-md border-gray-300 border px-3 py-2.5 text-sm focus:border-[#12753e] focus:ring-[#12753e] outline-none bg-white"
                    required
                >
                    <option value="" disabled>Selecciona una provincia</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
        </div>

        {/* City & Dept */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Ciudad</label>
                <input 
                    name="city" 
                    defaultValue={initialData.city} 
                    className="w-full rounded-md border-gray-300 border px-3 py-2.5 text-sm focus:border-[#12753e] focus:ring-[#12753e] outline-none"
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Departamento (opcional)</label>
                <input 
                    name="apartment" 
                    defaultValue={initialData.addressLine2} 
                    className="w-full rounded-md border-gray-300 border px-3 py-2.5 text-sm focus:border-[#12753e] focus:ring-[#12753e] outline-none"
                    placeholder="Ej: 201"
                />
            </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
             <label className="block text-xs font-medium text-gray-500">Indicaciones para la entrega (opcional)</label>
             <textarea 
                name="instructions" 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value.slice(0, 128))}
                className="w-full rounded-md border-gray-300 border px-3 py-2.5 text-sm focus:border-[#12753e] focus:ring-[#12753e] outline-none resize-none h-24"
                placeholder="Ej.: Entre calles, color del edificio, no tiene timbre."
             />
             <div className="text-right text-xs text-gray-400">
                {instructions.length} / 128
             </div>
        </div>

        {/* Type */}
        <div className="space-y-3">
             <label className="block text-xs font-medium text-gray-500">Tipo de domicilio</label>
             <div className="flex items-center gap-6">
                 <label className="flex items-center gap-2 cursor-pointer">
                     <input type="radio" name="type" value="RESIDENCIAL" defaultChecked={initialData.addressType !== 'LABORAL'} className="text-[#12753e] focus:ring-[#12753e]" />
                     <span className="text-sm">Residencial</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                     <input type="radio" name="type" value="LABORAL" defaultChecked={initialData.addressType === 'LABORAL'} className="text-[#12753e] focus:ring-[#12753e]" />
                     <span className="text-sm">Laboral</span>
                 </label>
             </div>
        </div>

        {/* Contact */}
         <div className="space-y-4 pt-2">
            <h3 className="text-sm font-medium text-gray-900">Datos de contacto</h3>
            <p className="text-xs text-gray-500 -mt-2">Te llamaremos si hay un problema con la entrega.</p>
            
            <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Nombre y apellido</label>
                <input 
                    name="contactName" 
                    defaultValue={initialData.name} 
                    className="w-full rounded-md border-gray-300 border px-3 py-2.5 text-sm focus:border-[#12753e] focus:ring-[#12753e] outline-none"
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Teléfono</label>
                <input 
                    name="contactPhone" 
                    defaultValue={initialData.phone} 
                     className="w-full rounded-md border-gray-300 border px-3 py-2.5 text-sm focus:border-[#12753e] focus:ring-[#12753e] outline-none"
                    required
                />
            </div>
        </div>

        <div className="flex justify-end pt-4 gap-4">
             <button 
                type="button" 
                onClick={onCancel}
                className="text-[#12753e] px-4 py-3 font-medium text-sm hover:opacity-80 transition-opacity"
            >
                Cancelar
            </button>
             <button 
                type="submit" 
                disabled={loading}
                className="bg-[#12753e] text-white px-8 py-3 rounded-md font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
                {loading ? "Guardando..." : "Guardar"}
             </button>
        </div>

      </form>
    </div>
  );
}
