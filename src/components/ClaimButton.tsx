"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ClaimButtonProps = {
  orderId: string;
  hasClaim: boolean;
  orderStatus: string;
};

export function ClaimButton({ orderId, hasClaim, orderStatus }: ClaimButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState("NOT_RECEIVED");
  const [description, setDescription] = useState("");

  if (hasClaim) {
      return (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
             En Reclamo
          </span>
      );
  }

  // Only allow claims for paid/fulfilled orders
  if (orderStatus === 'PENDING' || orderStatus === 'CANCELLED') {
      return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/claim`, {
        method: "POST",
        body: JSON.stringify({ type, description }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar reclamo");

      toast.success("Reclamo iniciado. Te contactaremos pronto.");
      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium"
      >
        Ayuda / Reclamo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold mb-2">Iniciar Reclamo</h3>
            <p className="text-sm text-foreground/70 mb-4">
              Cuéntanos qué pasó con tu pedido {orderId.slice(-4).toUpperCase()}.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Motivo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-md border p-2 text-sm bg-background"
                >
                  <option value="NOT_RECEIVED">No recibí el producto</option>
                  <option value="DAMAGED">Producto dañado / defectuoso</option>
                  <option value="OTHER">Otro problema</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border p-2 text-sm bg-background min-h-[100px]"
                  placeholder="Detalla el problema aquí..."
                  required
                  minLength={10}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-foreground/5"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-red-600 text-white px-3 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Reclamo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
