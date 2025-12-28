"use client";

import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const [data, setData] = useState("No result");
  const [hasScanned, setHasScanned] = useState(false);
  const router = useRouter();

  const handleScan = async (result: any, error: any) => {
    if (!!result && !hasScanned) {
      setHasScanned(true);
      const code = result?.text;
      setData(code);
      toast.success("Código detectado: " + code);

      // Verify pickup code via server action or API
      try {
        const response = await fetch("/api/orders/verify-pickup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pickupCode: code }),
        });

        if (response.ok) {
            const order = await response.json();
            toast.success("Orden encontrada. Redirigiendo...");
            router.push(`/orders/${order.id}`);
        } else {
            toast.error("Código inválido o no encontrado.");
            setHasScanned(false);
        }
      } catch (e) {
        console.error(e);
        toast.error("Error al verificar código.");
        setHasScanned(false);
      }
    }

    if (!!error) {
      // console.info(error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Escanear QR de Retiro</h1>
        <p className="text-gray-500">Apunta la cámara al código QR del cliente.</p>
      </div>

      <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-black">
        <QrReader
          onResult={handleScan}
          constraints={{ facingMode: "environment" }}
          className="w-full"
          scanDelay={500}
        />
      </div>

      <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-xs text-uppercase text-gray-400 font-semibold mb-1">ÚLTIMO ESCANEO</p>
        <p className="font-mono text-lg truncate">{data}</p>
      </div>

      <button 
        onClick={() => setHasScanned(false)}
        className="w-full bg-[#12753e] text-white py-3 rounded-lg font-bold hover:bg-[#0f5f32] transition-colors"
      >
        Escanear Otro
      </button>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">O ingresar manulamente</span>
        </div>
      </div>

      <form onSubmit={(e) => {
          e.preventDefault();
          // reuse logic
          const formData = new FormData(e.currentTarget);
          const code = formData.get("manualCode") as string;
          if(code) handleScan({ text: code }, null);
      }} className="space-y-4">
        <div>
           <input 
              name="manualCode"
              placeholder="Código manual (ej. XS82)"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg text-center font-mono uppercase focus:border-[#12753e] focus:ring-[#12753e]"
              minLength={4}
              required
           />
        </div>
        <button 
          type="submit"
          disabled={hasScanned}
          className="w-full bg-white border-2 border-[#12753e] text-[#12753e] py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Validar Código
        </button>
      </form>
    </div>
  );
}
