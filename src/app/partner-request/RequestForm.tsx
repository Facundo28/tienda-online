"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle, X, Upload, FileCheck, Shield, Car, User } from "lucide-react";
import { submitPartnerRequest } from "./actions";

export default function RequestForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (formData: FormData) => {
        // Validate at least some files are present? 
        // For now relying on Server Action.
        
        startTransition(async () => {
            try {
                await submitPartnerRequest(formData);
                setIsSuccess(true);
                toast.success("Solicitud enviada correctamente");
            } catch (error) {
                console.error(error);
                toast.error("Error al enviar solicitud. Revisa los archivos.");
            }
        });
    };

    const resetForm = () => {
        setIsOpen(false);
        setIsSuccess(false);
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="block w-full bg-white text-[#12753e] font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-sm text-center"
            >
                Enviar Documentación
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        
                        {isSuccess ? (
                            <div className="p-12 flex flex-col items-center text-center overflow-y-auto">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Documentación Recibida!</h3>
                                <p className="text-gray-500 mb-8 max-w-md">
                                    Hemos recibido tus datos y archivos. Nuestro equipo de compliance verificará la documentación (Cédula, Seguro, VTV, etc.) y te contactará en 48hs hábiles.
                                </p>
                                <button 
                                    onClick={resetForm}
                                    className="bg-[#12753e] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0f5f32] transition-colors"
                                >
                                    Entendido, gracias
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Postulación Partner Logístico</h3>
                                        <p className="text-xs text-gray-500">Completa tus datos y sube la documentación requerida.</p>
                                    </div>
                                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <form action={handleSubmit} className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
                                    {/* Personal Data */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 font-bold text-gray-800 border-b pb-2">
                                            <User className="w-4 h-4 text-[#12753e]" />
                                            Datos Personales
                                        </h4>
                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-bold text-gray-700">Nombre Completo</label>
                                                <input 
                                                    name="fullName" 
                                                    required 
                                                    placeholder="Ej: Juan Pérez" 
                                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#12753e] focus:bg-white transition-all placeholder:text-gray-400" 
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-bold text-gray-700">Email</label>
                                                    <input 
                                                        name="email" 
                                                        type="email" 
                                                        required 
                                                        placeholder="email@ejemplo.com" 
                                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#12753e] focus:bg-white transition-all placeholder:text-gray-400" 
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-bold text-gray-700">Teléfono</label>
                                                    <input 
                                                        name="phone" 
                                                        type="tel" 
                                                        required 
                                                        placeholder="+54 11..." 
                                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#12753e] focus:bg-white transition-all placeholder:text-gray-400" 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vehicle Data */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 font-bold text-gray-800 border-b pb-2">
                                            <Car className="w-4 h-4 text-[#12753e]" />
                                            Datos del Vehículo
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-bold text-gray-700">Tipo de Vehículo</label>
                                                <select 
                                                    name="vehicleType" 
                                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#12753e] focus:bg-white transition-all text-gray-700"
                                                >
                                                    <option value="MOTO">Moto / Ciclomotor</option>
                                                    <option value="AUTO">Auto Sedan/Hatch</option>
                                                    <option value="UTILITARIO">Utilitario Pequeño</option>
                                                    <option value="CAMIONETA">Furgón / Camioneta</option>
                                                    <option value="CAMION">Camión</option>
                                                </select>
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-bold text-gray-700">Modelo (Año)</label>
                                                <input 
                                                    name="vehicleModelYear" 
                                                    type="number" 
                                                    required 
                                                    placeholder="Ej: 2018" 
                                                    min="2005" 
                                                    max="2026" 
                                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#12753e] focus:bg-white transition-all placeholder:text-gray-400" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Docs Upload */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 font-bold text-gray-800 border-b pb-2">
                                            <Shield className="w-4 h-4 text-[#12753e]" />
                                            Documentación Excluyente (PDF/JPG)
                                        </h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FileUploadField label="Cédula Verde/Azul" name="cedulaFile" />
                                            <FileUploadField label="Licencia de Conducir" name="licenciaFile" />
                                            <FileUploadField label="Seguro Vigente" name="seguroFile" />
                                            <FileUploadField label="VTV / RTO al día" name="vtvFile" />
                                            <FileUploadField label="Constancia CUIT/Monotributo" name="cuitFile" />
                                            <FileUploadField label="Antecedentes Penales" name="antecedentesFile" />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <button 
                                            type="submit" 
                                            disabled={isPending}
                                            className="w-full bg-[#12753e] text-white py-4 rounded-xl font-bold hover:bg-[#0f5f32] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            {isPending ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Subiendo Documentación...
                                                </>
                                            ) : (
                                                <>
                                                    <FileCheck className="w-5 h-5" />
                                                    Enviar Postulación Completa
                                                </>
                                            )}
                                        </button>
                                        <p className="text-xs text-center text-gray-400 mt-4">
                                            Tus documentos serán almacenados de forma segura y solo utilizados para validación de identidad.
                                        </p>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

function FileUploadField({ label, name }: { label: string, name: string }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}</label>
            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-green-500 transition-colors group">
                <Upload className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                <span className="text-sm text-gray-500 group-hover:text-gray-700 truncate">Seleccionar archivo...</span>
                <input type="file" name={name} accept=".pdf,image/*" className="hidden" required />
            </label>
        </div>
    );
}
