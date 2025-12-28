"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoiceDocument } from "./InvoiceDocument";
import { Download } from "lucide-react";

export function DownloadInvoiceButton({ order }: { order: any }) {
  return (
    <PDFDownloadLink
      document={<InvoiceDocument order={order} />}
      fileName={`boleta-${order.id.slice(-6)}.pdf`}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-foreground/5 shadow-sm transition-colors"
    >
      {/* @ts-ignore */}
      {({ blob, url, loading, error }) => (
        <>
          <Download className="h-3.5 w-3.5" />
          {loading ? "Generando..." : "Descargar Boleta"}
        </>
      )}
    </PDFDownloadLink>
  );
}
