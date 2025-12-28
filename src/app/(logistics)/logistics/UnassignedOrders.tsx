"use client";

import { useState } from "react";
import { assignOrderAction } from "./actions";
import { toast } from "sonner";

type Order = {
  id: string;
  customerName: string;
  addressLine1: string;
  city: string;
  totalCents: number;
};

type Driver = {
  id: string;
  name: string;
};

export function UnassignedOrders({ orders, drivers }: { orders: Order[], drivers: Driver[] }) {
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const handleAssign = async (orderId: string) => {
    const driverId = selectedDriver[orderId];
    if (!driverId) {
      toast.error("Selecciona un conductor primero");
      return;
    }

    setLoading(orderId);
    try {
      await assignOrderAction(orderId, driverId);
      toast.success("Pedido asignado correctamente");
    } catch (e) {
      toast.error("Error al asignar pedido");
    } finally {
      setLoading(null);
    }
  };

  if (orders.length === 0) {
      return (
        <div className="bg-white p-8 rounded-xl border border-dashed text-center text-gray-400">
            No hay pedidos pendientes de asignación.
        </div>
      )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{order.customerName}</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold">PENDIENTE</span>
            </div>
            <p className="text-gray-500 text-sm">{order.addressLine1}, {order.city}</p>
            <p className="text-xs text-gray-400 font-mono mt-1">#{order.id.slice(-6)}</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="border rounded-lg p-2 text-sm max-w-[200px]"
              value={selectedDriver[order.id] || ""}
              onChange={(e) => setSelectedDriver({ ...selectedDriver, [order.id]: e.target.value })}
            >
              <option value="">-- Asignar a... --</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleAssign(order.id)}
              disabled={loading === order.id}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
            >
              {loading === order.id ? "Asignando..." : "Asignar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
