"use client";

import { useState } from "react";
import { assignOrderAction } from "./actions";
import { toast } from "sonner";
import { User, MapPin, Truck, ChevronRight, Package, ArrowRight } from "lucide-react";

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
        <div className="bg-gray-50/50 p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 shadow-sm">
                <Package className="w-8 h-8" />
            </div>
            <div>
                <p className="font-bold text-gray-900 text-lg">Todo al día</p>
                <p className="text-gray-500">No hay pedidos pendientes de asignación.</p>
            </div>
        </div>
      )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                    <User className="w-4 h-4" />
                </div>
                <div>
                   <span className="font-bold text-gray-900 block leading-none">{order.customerName}</span>
                   <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">ID: {order.id.slice(-6)}</span>
                </div>
                <span className="ml-auto md:ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold border border-yellow-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-pulse"></span>
                    PENDIENTE
                </span>
            </div>
            
            <div className="flex items-start gap-2 text-gray-500 text-sm pl-1">
                <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                <span className="line-clamp-1">{order.addressLine1}, {order.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
            <div className="relative">
                <Truck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                className="bg-white border-0 py-2 pl-9 pr-8 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#12753e] hover:bg-gray-50 transition-colors cursor-pointer appearance-none w-full md:w-48 shadow-sm"
                value={selectedDriver[order.id] || ""}
                onChange={(e) => setSelectedDriver({ ...selectedDriver, [order.id]: e.target.value })}
                >
                <option value="">Seleccionar conductor...</option>
                {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                    {d.name}
                    </option>
                ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l pl-2 border-gray-100">
                    <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
                </div>
            </div>
            
            <button
              onClick={() => handleAssign(order.id)}
              disabled={loading === order.id || !selectedDriver[order.id]}
              className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/10 active:scale-95 flex-shrink-0"
              title="Asignar Pedido"
            >
              {loading === order.id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                  <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
