"use client";

import { useState } from "react";
import { toast } from "sonner";
import { completeDeliveryAction } from "../../actions"; // Adjust path if needed
import Image from "next/image";

export function DeliveryActions({ orderId }: { orderId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleStartDelivery = () => {
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Debes tomar una foto de prueba.");
      return;
    }

    setLoading(true);

    try {
      // 1. Get Geolocation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // 2. Upload Photo
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Error subiendo foto");
      const { url } = await uploadRes.json();

      // 3. Complete Action
      await completeDeliveryAction(orderId, latitude, longitude, url);
      
      toast.success("Entrega registrada con éxito");
      
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar entrega. Verifica tu GPS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t pb-safe z-40">
        <button 
            onClick={handleStartDelivery}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
            <span>📸</span> ESCANEAR PARA ENTREGAR
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col p-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center text-white mb-8">
                <h2 className="text-xl font-bold">Confirmar Entrega</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/10 rounded-full">✕</button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <label className="w-full aspect-[3/4] bg-gray-800 rounded-3xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors relative overflow-hidden group">
                    {preview ? (
                        <img src={preview} alt="Proof" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                📸
                            </div>
                            <span className="text-gray-400 font-medium">Tocar para tomar foto</span>
                        </>
                    )}
                    <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        onChange={handleFileChange} 
                        className="hidden" 
                    />
                </label>
                
                <p className="text-white/50 text-xs text-center px-8">
                    Se registrará tu ubicación actual como prueba de entrega. 
                    Asegúrate de estar en el domicilio.
                </p>
            </div>

            <button 
                onClick={handleSubmit}
                disabled={loading || !file}
                className="w-full bg-[#12753e] disabled:bg-gray-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg mt-6"
            >
                {loading ? "Procesando..." : "Confirmar Entrega"}
            </button>
        </div>
      )}
    </>
  );
}
