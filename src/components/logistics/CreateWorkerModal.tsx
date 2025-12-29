"use client";

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { createWorkerAction } from "@/app/(logistics)/logistics/actions";
import { toast } from "sonner";

export function CreateWorkerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // We'll wrap the server action to handle client-side loading/toast
  async function handleSubmit(formData: FormData) {
      setLoading(true);
      try {
          // Note: In a real app we might want to bind this or handle errors better
          // For now, we rely on the server action revalidating path
          await createWorkerAction(formData);
          toast.success("Conductor creado correctamente");
          setIsOpen(false);
      } catch (e) {
          toast.error("Error al crear conductor");
      } finally {
          setLoading(false);
      }
  }

  return (
    <>
        <button 
            onClick={() => setIsOpen(true)}
            className="w-full mt-6 py-3 border-t border-gray-100 text-sm font-bold text-gray-500 hover:text-gray-800 flex items-center justify-center gap-2 group transition-colors"
        >
            <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Nuevo Conductor
        </button>

        {isOpen && (
            <div className="fixed inset-0 z-[500] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-xl flex items-center gap-2 text-gray-800">
                             <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[#12753e]">
                                <UserPlus className="w-4 h-4" />
                             </div>
                             Alta de Conductor
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form action={handleSubmit} className="p-6 space-y-5">
                       {/* Personal Info */}
                       <div className="space-y-4">
                           <h4 className="text-sm font-bold text-[#12753e] uppercase tracking-wider border-b border-gray-100 pb-2">Información Personal</h4>
                           
                           <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1 col-span-2">
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nombre Completo</label>
                                   <input 
                                        name="name" 
                                        required 
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#12753e] focus:border-[#12753e] outline-none transition-all placeholder:text-gray-300" 
                                        placeholder="Ej: Juan Perez" 
                                    />
                               </div>
                               <div className="space-y-1 col-span-2">
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
                                   <input 
                                        name="email" 
                                        type="email" 
                                        required 
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#12753e] focus:border-[#12753e] outline-none transition-all placeholder:text-gray-300" 
                                        placeholder="juan@flota.com" 
                                    />
                               </div>
                               <div className="space-y-1">
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">DNI</label>
                                   <input 
                                        name="dni" 
                                        required 
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#12753e] outline-none placeholder:text-gray-300" 
                                        placeholder="1234..." 
                                    />
                               </div>
                               <div className="space-y-1">
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Teléfono</label>
                                   <input 
                                        name="phone" 
                                        required 
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#12753e] outline-none placeholder:text-gray-300" 
                                        placeholder="11..." 
                                    />
                               </div>
                           </div>
                       </div>

                       {/* Vehicle Info */}
                       <div className="space-y-4 pt-2">
                            <h4 className="text-sm font-bold text-[#12753e] uppercase tracking-wider border-b border-gray-100 pb-2">Información del Vehículo</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Tipo</label>
                                   <select 
                                        name="vehicleType" 
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#12753e] outline-none text-gray-700"
                                        defaultValue="MOTO"
                                   >
                                       <option value="MOTO">Moto</option>
                                       <option value="AUTO">Auto</option>
                                       <option value="CAMIONETA">Camioneta</option>
                                       <option value="BICICLETA">Bicicleta</option>
                                   </select>
                               </div>
                               <div className="space-y-1">
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Patente</label>
                                   <input 
                                        name="vehiclePlate" 
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#12753e] outline-none placeholder:text-gray-300 uppercase" 
                                        placeholder="AA 123 BB" 
                                    />
                               </div>
                               <div className="space-y-1">
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Modelo</label>
                                   <input 
                                        name="vehicleModel" 
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#12753e] outline-none placeholder:text-gray-300" 
                                        placeholder="Honda Wave" 
                                    />
                               </div>
                               <div className="space-y-1">
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Color</label>
                                   <input 
                                        name="vehicleColor" 
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#12753e] outline-none placeholder:text-gray-300" 
                                        placeholder="Rojo" 
                                    />
                               </div>
                            </div>
                       </div>
                       
                       <div className="pt-4">
                            <button 
                                disabled={loading}
                                type="submit"
                                className="w-full bg-[#12753e] hover:bg-[#0e5c30] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? "Registrando..." : "Dar de Alta Conductor"}
                            </button>
                       </div>
                    </form>
                </div>
            </div>
        )}
    </>
  );
}
