"use client";

import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { toast } from "sonner";
import { formatCurrencyFromCents } from "@/lib/money";

export default function ScanPage() {
  const [data, setData] = useState("No result");
  const [manualCode, setManualCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastScannedOrder, setLastScannedOrder] = useState<any>(null);
  
  // Geolocation State
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => setGeoError(err.message)
        );
    } else {
        setGeoError("No soportado");
    }
  }, []);

  const handleScan = async (result: any, error: any) => {
    if (!!result && result?.text !== data) {
      const rawText = result?.text;
      setData(rawText);

      let codeToValidate = rawText;
      try {
        // Try parsing as JSON (New Enhanced QR)
        const parsed = JSON.parse(rawText);
        if (parsed.c) {
          codeToValidate = parsed.c;
          // Could also use parsed.b (buyer) and parsed.s (seller) for UI if needed locally
        }
      } catch (e) {
        // Not JSON, assume legacy raw code
      }

      await validateCode(codeToValidate);
    }

    if (!!error) {
      // console.info(error);
    }
  };

  const validateCode = async (code: string) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            code,
            lat: location?.lat,
            lng: location?.lng
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Error al validar código");
        setLastScannedOrder(null);
      } else {
        toast.success(`Pedido entregado a ${json.order.customerName}`);
        setLastScannedOrder(json.order);
        setManualCode("");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    validateCode(manualCode);
  };

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Escanear Código</h1>
        <p className="text-foreground/70">
          Escanea el QR del cliente o ingresa el código manualmente.
        </p>
      </div>

      <div className={`flex items-center gap-2 text-xs font-medium ${location ? "text-green-600" : "text-amber-600"}`}>
         {location ? "📍 Ubicación Segura: Activa" : `⚠️ GPS Inactivo (${geoError || "Esperando..."})`}
      </div>

      {/* Error Message Box */}
      {data !== "No result" && !lastScannedOrder && !isLoading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 text-sm text-center">
            {/* We rely on toast but also show generic error here if needed, or if we store lastError state */}
            <p className="font-semibold">Último escaneo fallido o inválido</p>
            <button onClick={() => setData("No result")} className="text-xs underline mt-1">Intentar de nuevo</button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-black">
        <div className="relative aspect-square w-full">
           {/* @ts-ignore */}
          <QrReader
            onResult={(result, error) => {
              if (!!result) {
                // Throttle duplicate scans slightly if needed, but logic handles it
                 handleScan(result, error);
              }
            }}
            constraints={{ facingMode: "environment" }}
            className="h-full w-full object-cover"
             // @ts-ignore
            containerStyle={{ width: '100%', height: '100%' }}
             // @ts-ignore
            videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="bg-foreground/5 p-4 text-center text-sm text-white/70">
          Apunta la cámara al código QR
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">O</span>
        </div>
      </div>

      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium">
            Código Manual
          </label>
          <input
            id="code"
            type="text"
            className="w-full rounded-md border bg-background px-3 py-2 text-2xl font-mono font-bold uppercase tracking-widest text-center"
            placeholder="XXXX"
            maxLength={8}
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || manualCode.length < 4}
          className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? "Validando..." : "Validar Código"}
        </button>
      </form>

      {lastScannedOrder && (
        <div className="rounded-xl border border-green-500/50 bg-green-500/10 p-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4 text-green-700 dark:text-green-400">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">¡Entrega Exitosa!</h3>
              <p className="text-sm opacity-90">
                Pedido actualizado a ENTREGADO
              </p>
              {lastScannedOrder.fundsReleased && (
                <div className="mt-2 rounded-md bg-green-600/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-800 dark:text-green-300">
                  🎉 Fondos Liberados al Vendedor
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="opacity-70">Cliente:</span>
              <span className="font-medium">
                {lastScannedOrder.customerName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Total:</span>
              <span className="font-medium">
                {formatCurrencyFromCents(lastScannedOrder.totalCents)}
              </span>
            </div>
            <div className="pt-2">
               <p className="opacity-70 mb-1">Items:</p>
               <ul className="list-disc list-inside text-xs opacity-80">
                 {lastScannedOrder.items.map((i: any, idx: number) => (
                   <li key={idx}>{i.quantity}x {i.name}</li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
