"use client";

import { useState } from "react";
import { toast } from "sonner";
import { generateTwoFactorSecret, verifyAndEnableAPP, sendOTP, verifyAndEnableOTP, disableMethod } from "@/app/account/security/actions";
import { ShieldCheck, Smartphone, Mail, AlertTriangle } from "lucide-react";

interface Props {
    method: "APP" | "EMAIL" | "SMS";
    title: string;
    description: string;
    details?: string;
    icon?: string;
    isEnabled: boolean;
    requiresPhone?: boolean; // For SMS if phone missing
}

export function TwoFactorSection({ method, title, description, details, icon, isEnabled, requiresPhone }: Props) {
    const [isExpanding, setIsExpanding] = useState(false);
    const [step, setStep] = useState<'IDLE' | 'SETUP_QR' | 'VERIFY'>('IDLE');
    const [loading, setLoading] = useState(false);
    
    // Setup Data
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [inputCode, setInputCode] = useState("");

    const handleStart = async () => {
        setLoading(true);
        try {
            if (method === "APP") {
                const res = await generateTwoFactorSecret();
                setQrUrl(res.qrCodeUrl);
                setStep('SETUP_QR');
            } else {
                // SMS / EMAIL
                await sendOTP(method);
                setStep('VERIFY');
                toast.success(`Código enviado por ${method}`);
            }
            setIsExpanding(true);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        try {
            if (method === "APP") {
                await verifyAndEnableAPP(inputCode);
            } else {
                await verifyAndEnableOTP(method, inputCode);
            }
            toast.success("¡Activado!");
            setStep('IDLE');
            setIsExpanding(false);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        if(!confirm(`¿Desactivar ${title}?`)) return;
        setLoading(true);
        try {
            await disableMethod(method);
            toast.success("Desactivado");
        } catch(e) { toast.error("Error"); }
        finally { setLoading(false); }
    };

    return (
        <div className={`bg-white rounded-xl border transition-all ${isEnabled ? 'border-green-200 bg-green-50/30' : 'border-gray-200 shadow-sm'}`}>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {icon ? (
                         <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border shadow-sm p-2">
                             <img src={icon} className="w-full h-full object-contain" />
                         </div>
                    ) : (
                         <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border shadow-sm text-gray-600">
                             {method === "SMS" ? <Smartphone size={20} /> : <Mail size={20} />}
                         </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{title}</h3>
                            {isEnabled && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase">Activado</span>}
                        </div>
                        <p className="text-sm text-gray-500">{description}</p>
                    </div>
                </div>

                {requiresPhone && !isEnabled ? (
                    <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-md border border-amber-100">
                        <AlertTriangle size={14} />
                        Agrega un teléfono en tu perfil
                    </div>
                ) : (
                    <div>
                         {isEnabled ? (
                             <button onClick={handleDisable} disabled={loading} className="text-red-600 hover:text-red-700 text-sm font-medium px-4 py-2 border border-red-100 rounded-lg hover:bg-red-50 bg-white">
                                 Desactivar
                             </button>
                         ) : (
                             !isExpanding && (
                                <button onClick={handleStart} disabled={loading} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
                                    {loading ? '...' : (method === 'APP' ? 'Configurar' : 'Activar')}
                                </button>
                             )
                         )}
                    </div>
                )}
            </div>

            {/* EXPANDABLE SETUP AREA */}
            {isExpanding && !isEnabled && (
                <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2">
                    <div className="border-t border-gray-100 pt-6">
                        {step === 'SETUP_QR' && qrUrl && (
                            <div className="flex flex-col items-center text-center">
                                <p className="text-sm font-medium mb-4">Escanea el código QR con tu app</p>
                                <img src={qrUrl} className="rounded-lg border p-2 mb-4 max-w-[180px]" />
                                <div className="max-w-xs w-full">
                                     <input 
                                        type="text" 
                                        placeholder="Código 6 dígitos" 
                                        className="w-full text-center tracking-widest text-lg border rounded-md p-2 mb-2"
                                        onChange={(e) => setInputCode(e.target.value)}
                                     />
                                     <button onClick={handleVerify} disabled={loading} className="w-full bg-[#12753e] text-white py-2 rounded-md font-medium">
                                         Verificar
                                     </button>
                                </div>
                            </div>
                        )}

                        {step === 'VERIFY' && (
                             <div className="flex flex-col items-center text-center max-w-sm mx-auto">
                                <p className="text-sm font-medium mb-4">Ingresa el código enviado por {method}</p>
                                <input 
                                    type="text" 
                                    placeholder="123456" 
                                    className="w-full text-center tracking-widest text-lg border rounded-md p-2 mb-4"
                                    onChange={(e) => setInputCode(e.target.value)}
                                />
                                <button onClick={handleVerify} disabled={loading} className="w-full bg-[#12753e] text-white py-2 rounded-md font-medium">
                                     Verificar Código
                                </button>
                             </div>
                        )}
                        
                         <button onClick={() => { setIsExpanding(false); setStep('IDLE'); }} className="block mx-auto mt-4 text-xs text-gray-500 hover:text-gray-900">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
