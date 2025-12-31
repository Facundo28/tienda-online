"use className";
"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
    >
      <Printer className="w-5 h-5" />
      Imprimir Etiqueta
    </button>
  );
}
