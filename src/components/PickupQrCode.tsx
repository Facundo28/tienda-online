"use client";

import QRCode from "react-qr-code";
import { useState } from "react";

type PickupQrProps = {
  orderId: string;
  pickupCode: string;
  buyerName: string;
  sellerName: string;
};

export function PickupQrCode({ orderId, pickupCode, buyerName, sellerName }: PickupQrProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Encode simplified JSON keys to save space in QR
  const qrData = JSON.stringify({
    c: pickupCode,
    b: buyerName,
    s: sellerName,
  });

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-foreground/5 shadow-sm"
      >
        Ver Código de Retiro
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm rounded-xl bg-background p-6 text-center shadow-xl">
        <h3 className="text-lg font-semibold">Código de Retiro</h3>
        <p className="text-sm text-foreground/70 mb-6">
          Muestra este código al vendedor para retirar tu compra.
        </p>

        <div className="mx-auto bg-white p-4 rounded-lg inline-block">
          <QRCode
            value={qrData}
            size={200}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
          />
        </div>

        <div className="mt-4 font-mono text-2xl font-bold tracking-widest text-foreground">
          {pickupCode}
        </div>
        
        <div className="mt-2 text-xs text-foreground/60 space-y-1">
            <div>Comprador: <strong>{buyerName}</strong></div>
            <div>Vendedor: <strong>{sellerName}</strong></div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="mt-6 w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
