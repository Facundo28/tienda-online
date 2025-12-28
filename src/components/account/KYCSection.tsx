"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Camera, Upload, X, RefreshCw, Check, AlertCircle, ScanFace, IdCard } from "lucide-react";

interface KYCSectionProps {
  user: {
    dni: string | null;
    documentFrontUrl: string | null;
    documentBackUrl: string | null;
    identitySelfieUrl: string | null;
    isVerified: boolean;
  };
}

export function KYCSection({ user }: KYCSectionProps) {
  const [activeCamera, setActiveCamera] = useState<string | null>(null); // 'documentFront' | 'documentBack' | 'identitySelfie' | null

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-gray-900 flex items-center gap-2">
          Validación de Identidad
          {user.isVerified ? (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full uppercase">
              Verificado
            </span>
          ) : (
            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full uppercase">
              Pendiente
            </span>
          )}
        </h2>
        <p className="text-sm text-gray-500">
          Para operar con mayor seguridad y evitar estafas, necesitamos validar tu
          identidad. Esta información es confidencial.
        </p>
      </div>

      <div className="space-y-6">
          {/* DNI Input */}
          <div className="grid gap-1.5">
             <label className="text-sm font-medium text-gray-700">Número de DNI</label>
             <input
                 name="dni"
                 defaultValue={user.dni || ""}
                 placeholder="Ej: 12345678"
                 className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#12753e] focus:border-[#12753e] md:w-1/2"
             />
         </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Front */}
          <KYCInput
            name="documentFront"
            label="Foto DNI (Frente)"
            currentUrl={user.documentFrontUrl}
            overlayType="card"
            activeCamera={activeCamera}
            setActiveCamera={setActiveCamera}
          />

          {/* Back */}
          <KYCInput
            name="documentBack"
            label="Foto DNI (Dorso)"
            currentUrl={user.documentBackUrl}
            overlayType="card"
            activeCamera={activeCamera}
            setActiveCamera={setActiveCamera}
          />

          {/* Selfie */}
          <KYCInput
            name="identitySelfie"
            label="Selfie (Rostro Claro)"
            currentUrl={user.identitySelfieUrl}
            overlayType="face"
            activeCamera={activeCamera}
            setActiveCamera={setActiveCamera}
          />
        </div>

        <div className="bg-blue-50 p-3 rounded-lg flex gap-3 text-blue-800 text-xs items-start">
             <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
             <p>Asegúrate de que el texto sea legible y no haya reflejos. En la selfie, tu rostro debe estar bien iluminado y centrado en el óvalo.</p>
        </div>
      </div>
    </div>
  );
}

function KYCInput({
  name,
  label,
  currentUrl,
  overlayType,
  activeCamera,
  setActiveCamera,
}: {
  name: string;
  label: string;
  currentUrl: string | null;
  overlayType: "card" | "face";
  activeCamera: string | null;
  setActiveCamera: (name: string | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const isCameraOpen = activeCamera === name;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const startCamera = async () => {
    setActiveCamera(name);
    try {
      const constraints = {
        video: {
            facingMode: overlayType === 'face' ? "user" : "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      // Wait for React to render the video element
      setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("No pudimos acceder a la cámara. Por favor, verifica los permisos.");
      setActiveCamera(null);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setActiveCamera(null);
  }, [stream, setActiveCamera]);

  const takePhoto = () => {
    if (videoRef.current) {
      // Simulation of "Analyzing"
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `${name}_capture.jpg`, { type: "image/jpeg" });
                
                if (fileInputRef.current) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    fileInputRef.current.files = dataTransfer.files;
                }
                
                setPreview(URL.createObjectURL(file));
                stopCamera();
            }
        }, 'image/jpeg', 0.9); // High quality
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-700 uppercase">
        {label}
      </label>

      {/* Preview / Default State */}
      {!isCameraOpen && (
        <div 
            onClick={!preview ? startCamera : undefined}
            className={`group relative aspect-video rounded-lg border-2 border-dashed ${preview ? 'border-[#12753e] bg-[#12753e]/5' : 'border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100'} flex flex-col items-center justify-center overflow-hidden transition-colors`}
        >
          {preview ? (
            <>
              <Image
                src={preview} 
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                 <button type="button" onClick={startCamera} className="bg-white px-4 py-2 rounded-full text-gray-900 font-medium text-xs hover:scale-105 transition flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5"/>
                    Volver a Escanear
                 </button>
              </div>
              {/* Quality Badge */}
              <div className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Check className="w-3 h-3" />
                  Legible
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 p-4 text-center">
               <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-1 text-gray-700">
                   {overlayType === 'face' ? <ScanFace className="w-6 h-6" /> : <IdCard className="w-6 h-6" />}
               </div>
               <div className="space-y-1">
                   <p className="text-sm font-semibold text-gray-900">
                       {overlayType === 'face' ? "Escanear Rostro" : "Escanear Documento"}
                   </p>
                   <p className="text-[10px] text-gray-400">
                       Habilitar cámara para capturar
                   </p>
               </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            name={name}
            className="hidden"
            accept="image/*"
            // onChange={handleFileChange} // Disable manual upload
          />
        </div>
      )}

      {/* Camera Modal / Overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg aspect-[3/4] md:aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-gray-800">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Simulated Scanning Grid/Laser */}
                <div className="absolute inset-0 pointer-events-none opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                
                {/* Overlay Guides */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-black/30"></div>
                     {overlayType === 'card' ? (
                         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] aspect-[1.586/1] border-2 border-white/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                             <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white"></div>
                             <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white"></div>
                             <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white"></div>
                             <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white"></div>
                             
                             {/* Scanning Bar Animation */}
                             <div className="absolute inset-x-0 h-0.5 bg-green-400/80 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-[scan_2s_ease-in-out_infinite] top-0"></div>
                             
                             <div className="absolute -bottom-10 w-full text-center">
                                 <p className="text-white font-bold text-shadow">Encuadra el DNI</p>
                                 <p className="text-white/70 text-xs">Evita reflejos y sombras</p>
                             </div>
                         </div>
                     ) : (
                         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-[3/4] border-2 border-white/50 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] overflow-hidden">
                              <div className="absolute inset-0 border-4 border-transparent border-t-white/80 rounded-[50%] animate-spin-slow opacity-50"></div>
                              <div className="absolute -bottom-12 w-full text-center">
                                  <p className="text-white font-bold">Rostro Centrado</p>
                              </div>
                         </div>
                     )}
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <button
                        type="button"
                        onClick={stopCamera}
                        className="p-4 text-white hover:bg-white/10 rounded-full transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    <button
                        type="button"
                        onClick={takePhoto}
                        className="rounded-full flex items-center justify-center transform active:scale-95 transition-all hover:scale-105 shadow-xl shadow-green-900/20"
                    >
                        <div className="w-16 h-16 rounded-full border-[5px] border-white flex items-center justify-center bg-white/20 backdrop-blur-sm">
                            <div className="w-12 h-12 bg-white rounded-full"></div>
                        </div>
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => {
                            stopCamera();
                            setTimeout(startCamera, 300); 
                        }}
                         className="p-4 text-white hover:bg-white/10 rounded-full transition"
                    >
                        <RefreshCw className="w-6 h-6" />
                    </button>
                </div>
            </div>
            
            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
            `}</style>
        </div>
      )}
    </div>
  );
}
