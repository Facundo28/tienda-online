"use client";

import { useState } from "react";
import { toast } from "sonner";
import { generateTwoFactorSecret, verifyAndEnableAPP, disableMethod } from "@/app/(shop)/account/security/actions";

interface TwoFactorSetupProps {
  isEnabled: boolean;
}

export function TwoFactorSetup({ isEnabled }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'initial' | 'setup' | 'verify'>('initial');
  const [qrData, setQrData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    try {
      const data = await generateTwoFactorSecret();
      setQrData(data);
      setStep('setup');
    } catch (e) {
      toast.error("Error al iniciar configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
      setLoading(true);
      try {
          await verifyAndEnableAPP(token);
          toast.success("¡Autenticación de dos pasos activada!");
          setStep('initial'); // Parent revalidates
      } catch (e: any) {
          toast.error(e.message);
      } finally {
          setLoading(false);
      }
  };
  
  const handleDisable = async () => {
      if(!confirm("¿Seguro que quieres desactivar la protección 2FA?")) return;
      try {
          await disableMethod("APP");
          toast.success("2FA desactivado");
      } catch(e) {
          toast.error("Error al desactivar");
      }
  };

  if (isEnabled) {
      return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                      </svg>
                  </div>
                  <div>
                      <h3 className="font-semibold text-green-900">Protección Activada</h3>
                      <p className="text-sm text-green-700">Tu cuenta está protegida con Google Authenticator.</p>
                  </div>
              </div>
              <button 
                onClick={handleDisable}
                type="button"
                className="text-red-600 hover:text-red-700 text-sm font-medium border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                disabled={loading}
              >
                  Desactivar
              </button>
          </div>
      );
  }

  return (
    <div className="mt-4">
        {step === 'initial' && (
             <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                 <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6e/Google_Authenticator_for_Android_icon.svg" width={24} height={24} alt="Google Auth"/>
                 </div>
                 <div className="flex-1">
                     <p className="text-sm font-medium text-gray-900">Google Authenticator</p>
                     <p className="text-xs text-gray-500">Recomendado</p>
                 </div>
                 <button 
                    onClick={startSetup}
                    disabled={loading}
                    className="bg-black text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-800 disabled:opacity-50"
                 >
                     {loading ? "..." : "Configurar"}
                 </button>
             </div>
        )}

        {step === 'setup' && qrData && (
            <div className="bg-white border rounded-xl p-6 mt-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center mb-6">
                    <h3 className="font-bold text-lg mb-2">Escanea el código QR</h3>
                    <p className="text-sm text-gray-500">Abre Google Authenticator o Authy y escanea este código.</p>
                </div>
                
                <div className="flex justify-center mb-6">
                    <img src={qrData.qrCodeUrl} alt="QR Code" className="rounded-lg border p-2" />
                </div>

                <div className="space-y-4 max-w-xs mx-auto">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ingresa el código de 6 dígitos</label>
                        <input 
                            type="text" 
                            className="w-full text-center text-2xl tracking-widest font-mono p-2 border rounded-md focus:ring-[#12753e] focus:border-[#12753e]" 
                            placeholder="000 000"
                            maxLength={6}
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={handleVerify}
                        disabled={loading || token.length < 6}
                        className="w-full bg-[#12753e] text-white py-2 rounded-md font-medium hover:bg-[#0e5c30] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Verificando..." : "Verificar y Activar"}
                    </button>
                    
                    <button 
                        onClick={() => setStep('initial')}
                        className="w-full text-xs text-gray-500 hover:text-gray-900"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}
