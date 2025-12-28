"use client";

import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const [data, setData] = useState("No result");
  const [hasScanned, setHasScanned] = useState(false);
  const [scanType, setScanType] = useState<"PICKUP" | "DELIVERY" | null>(null);
  const [deliveryWords, setDeliveryWords] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const router = useRouter();

  // Handle Scan Result
  const handleScan = async (result: any, error: any) => {
    if (!!result && !hasScanned) {
      setHasScanned(true);
      const code = result?.text;
      setData(code);
      toast.info("Código detectado. Procesando...");

      // Determine Type by Format (UUID vs ShortCode)
      // Basic heuristic: UUID is long (>20 chars), ShortCode is short (<10)
      if (typeof code === 'string' && code.length > 20) {
          toast.info("Paquete detectado. Redirigiendo...", { icon: "🚚" });
          router.push(`/delivery/orders/${code}`);
          return;
      } else {
          setScanType("PICKUP");
          processScan(code, "PICKUP");
      }
    }
  };

  const processScan = async (code: string, type: "PICKUP" | "DELIVERY", words?: string, photo?: File) => {
      setGpsLoading(true);
      
      // Get GPS
      navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          try {
             // Use FormData if delivery (for photo)
             let body: any;
             let headers: any = {};
             
             if (type === "DELIVERY" && photo) {
                 const fd = new FormData();
                 fd.append("code", code);
                 fd.append("lat", lat.toString());
                 fd.append("lng", lng.toString());
                 fd.append("words", words?.toUpperCase() || "");
                 fd.append("proofPhoto", photo);
                 body = fd;
                 // Don't set Content-Type, fetch sets it with boundary
             } else {
                 body = JSON.stringify({ 
                    code, 
                    lat, 
                    lng, 
                    words: words?.toUpperCase() 
                 });
                 headers["Content-Type"] = "application/json";
             }
             
             const response = await fetch("/api/scan", {
                method: "POST",
                headers,
                body,
             });
             
             const data = await response.json();

             if (response.ok) {
                 toast.success(type === "DELIVERY" ? "¡ENTREGA CONFIRMADA!" : "¡RETIRO EXITOSO!");
                 // Provide haptic feedback if possible
                 if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                 setTimeout(() => {
                     setHasScanned(false);
                     setScanType(null);
                     setDeliveryWords("");
                     setData("No result");
                 }, 3000);
             } else {
                 toast.error(data.error || "Error al procesar");
                 // If delivery failed, ask for retry without resetting everything immediately
                 if (type === "PICKUP") setHasScanned(false);
             }

          } catch (e) {
              toast.error("Error de conexión");
              setHasScanned(false);
          } finally {
              setGpsLoading(false);
          }

      }, (err) => {
          toast.error("Error GPS: " + err.message);
          setGpsLoading(false);
          setHasScanned(false);
      }, { enableHighAccuracy: true, timeout: 5000 });
  };
  
  const handleDeliverySubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // Only for legacy direct scan mode if enabled, but mostly we redirect now.
      // Keeping this largely for fallback or if we revert.
      if (!deliveryWords) return toast.error("Ingresa las palabras clave");
      
      const formData = new FormData(e.currentTarget);
      const photoFile = formData.get("proofPhoto") as File;
      
      if (!photoFile || photoFile.size === 0) {
          return toast.error("Debes subir una foto de prueba.");
      }

      processScan(data, "DELIVERY", deliveryWords, photoFile);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Escáner Logístico</h1>
        <p className="text-gray-500">Sistema V2 - Geolocalización Activa</p>
      </div>

      { !scanType || scanType === "PICKUP" ? (
          <>
            <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-black relative">
                <QrReader
                onResult={handleScan}
                constraints={{ facingMode: "environment" }}
                className="w-full"
                scanDelay={500}
                />
                {gpsLoading && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white flex-col gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                        <p className="text-xs font-mono">OBTENIENDO GPS...</p>
                    </div>
                )}
            </div>
            
            <p className="text-center text-xs text-gray-400">
                Apunta al código QR del cliente (Retiro) o del Paquete (Delivery)
            </p>
          </>
      ) : (
          <div className="bg-white border rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4">
               {/* Delivery Form (Legacy/Direcy Mode) */}
               <div className="flex flex-col items-center gap-4 text-center">
                   <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl">
                       🛡️
                   </div>
                   <div>
                       <h2 className="text-xl font-bold text-gray-900">Seguridad de Entrega</h2>
                       <p className="text-sm text-gray-500">Pídele al cliente las 3 palabras clave.</p>
                   </div>
                   
                   <form onSubmit={handleDeliverySubmit} className="w-full space-y-4">
                        <input 
                            autoFocus
                            value={deliveryWords}
                            onChange={(e) => setDeliveryWords(e.target.value)}
                            placeholder="EJ: ROJO-MESA-PATO"
                            className="w-full text-center text-xl font-mono uppercase tracking-widest p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                        />
                        <button 
                            disabled={gpsLoading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {gpsLoading ? "VERIFICANDO..." : "CONFIRMAR ENTREGA"}
                        </button>
                        
                        <div className="text-left bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <label className="block text-sm font-bold text-gray-700 mb-2">📸 Foto de Prueba (Obligatorio)</label>
                             <input 
                                 type="file" 
                                 accept="image/*" 
                                 capture="environment" 
                                 name="proofPhoto"
                                 required
                                 className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                             />
                        </div>
                        
                        <button 
                            type="button"
                            onClick={() => { setScanType(null); setHasScanned(false); }}
                            className="text-gray-400 text-sm hover:text-gray-600"
                        >
                            Cancelar
                        </button>
                   </form>
               </div>
          </div>
      )}

      {/* Manual Input Fallback */}
      {!scanType && (
          <details className="text-xs text-gray-400 text-center cursor-pointer">
              <summary>¿Problemas con la cámara?</summary>
              <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  handleScan({ text: fd.get("code") }, null);
              }} className="mt-2 flex gap-2">
                  <input name="code" placeholder="Código Manual" className="flex-1 border p-2 rounded" />
                  <button className="bg-gray-200 px-4 rounded font-bold">OK</button>
              </form>
          </details>
      )}
    </div>
  );
}
