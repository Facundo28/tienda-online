"use client";

import { useState } from "react";
import { AddressForm } from "./AddressForm";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AddressSelectorProps {
  user: any;
  updateAction: (formData: FormData) => Promise<void>;
}

export function AddressSelector({ user, updateAction }: AddressSelectorProps) {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [postalCodeInput, setPostalCodeInput] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handlePostalCodeSubmit = async () => {
      if (!postalCodeInput) return;
      setIsPending(true);
      try {
          const formData = new FormData();
          formData.append("postalCode", postalCodeInput);
          // Preserve other fields if possible, or just update CP
          // Since updateAction updates what's present, passing just CP should be safe if the action handles partials.
          // However, checking account/actions.ts: it updates everything present. 
          // We need to be careful not to wipe other fields if they are required but missing.
          // Let's pass current values for required fields just in case context needs it.
          formData.append("name", user.name);
          formData.append("email", user.email); 
          await updateAction(formData);
          toast.success(`Ubicación actualizada: CP ${postalCodeInput}`);
      } catch (error) {
          toast.error("Error al actualizar ubicación");
      } finally {
          setIsPending(false);
      }
  };
  
  // Checking if user has address data
  const hasAddress = !!user.addressLine1;

  if (view === 'form') {
    return (
        <AddressForm 
            initialData={{
                addressLine1: user.addressLine1 || "",
                addressLine2: user.addressLine2 || "",
                city: user.city || "",
                state: user.state || "",
                postalCode: user.postalCode || "",
                addressInstructions: user.addressInstructions || "",
                addressType: user.addressType || "RESIDENCIAL",
                name: user.name,
                phone: user.phone || ""
            }}
            userId={user.id}
            updateAction={async (fd) => {
                await updateAction(fd);
                setView('list'); // Return to list after save
            }}
            onCancel={() => setView('list')}
        />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
           <h1 className="text-xl font-semibold text-gray-900">Elegí dónde recibir tus compras</h1>
           <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Volver
            </Link>
        </div>
        
        {/* Current Address Card */}
        {hasAddress && (
             <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-4 flex items-start gap-3">
                    <div className="pt-1">
                        <input type="radio" checked readOnly className="h-4 w-4 text-[#12753e] border-gray-300 focus:ring-[#12753e]" />
                    </div>
                    <div className="flex-1">
                         <div className="text-sm font-normal text-gray-900">
                            {user.addressLine1} {user.addressLine2 ? `(${user.addressLine2})` : ''}
                         </div>
                         <div className="text-xs text-gray-500 mt-0.5">
                             CP: {user.postalCode} - {user.city}, {user.state} {' '} 
                             <span className="text-gray-300 mx-1">|</span> 
                             {' '} {user.name} - {user.phone}
                         </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-2 border-t">
                    <button onClick={() => setView('form')} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                        Editar direcciones
                    </button>
                </div>
             </div>
        )}

        {/* In another location */}
        <div>
            <h2 className="text-sm font-medium text-gray-900 mb-3">En otra ubicación</h2>
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                 {/* Zip Input */}
                 <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Código Postal</label>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-[200px]">
                            <input 
                                type="text" 
                                placeholder="Ingresar un código postal" 
                                className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-[#12753e] focus:ring-[#12753e] outline-none pr-16"
                                value={postalCodeInput}
                                onChange={(e) => setPostalCodeInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handlePostalCodeSubmit();
                                }}
                            />
                            <button 
                                onClick={handlePostalCodeSubmit}
                                type="button"
                                disabled={isPending || !postalCodeInput}
                                className="absolute right-1 top-1 bottom-1 bg-[#e3edff] text-[#3483fa] px-3 rounded text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                            >
                                {isPending ? '...' : 'Usar'}
                            </button>
                        </div>
                        <a href="https://www.correoargentino.com.ar/formularios/cpa" target="_blank" rel="noopener noreferrer" className="text-xs text-[#3483fa] hover:underline">
                            No sé mi código
                        </a>
                    </div>
                 </div>

                 <div className="border-t border-gray-100 pt-5">
                      <button 
                        onClick={() => setView('form')}
                        className="flex items-center gap-2 text-[#3483fa] hover:bg-blue-50 px-2 py-1.5 rounded-md -ml-2 transition-colors"
                      >
                         <div className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center font-bold text-lg leading-none pb-0.5">
                            +
                         </div>
                         <span className="text-sm font-medium">Agregar dirección completa</span>
                      </button>
                 </div>
            </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-2">
            <Link 
                href="/"
                className="px-4 py-2 text-sm font-medium text-[#3483fa] bg-[#f5f5f5] rounded-md hover:bg-gray-200 transition-colors"
            >
                Cancelar
            </Link>
             <button 
                className="px-4 py-2 text-sm font-medium text-white bg-[#3483fa] rounded-md hover:bg-blue-600 transition-colors shadow-sm"
                onClick={() => toast.success("Cambios guardados")}
            >
                Guardar cambios
            </button>
        </div>
    </div>
  );
}
