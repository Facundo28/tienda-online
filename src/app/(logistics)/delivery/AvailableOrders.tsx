import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { DeliveryStatus } from "@/generated/prisma/enums";
import { assignOrderToMe } from "./actions";
import { MapPin, DollarSign, Package, Navigation, Clock } from "lucide-react";

export async function AvailableOrdersSection() {
    const user = await requireUser();
    
    // Find orders with NO courier, but meant for Delivery
    const availableOrders = await prisma.order.findMany({
        where: {
            courierId: null,
            deliveryMethod: "DELIVERY",
            deliveryStatus: "PENDING", // Not delivered yet
            // In a real app, filter by Company or Geo
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    if (availableOrders.length === 0) return null;

    return (
        <section className="px-1">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    Disponibles cerca
                </h2>
                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-lg">
                    {availableOrders.length} nuevos
                </span>
            </div>

            <div className="space-y-4">
                {availableOrders.map((order: any) => (
                    <div key={order.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden group">
                        
                        <div className="flex gap-4 items-start">
                            {/* Icon Box */}
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-blue-500 mt-1">
                                <Package className="w-6 h-6" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1 truncate">
                                    {order.city || "Ciudad Desconocida"}
                                </h4>
                                <div className="flex items-start gap-1.5 text-gray-500 text-sm mb-3">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                    <span className="line-clamp-2 leading-snug">{order.addressLine1}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-sm font-bold">
                                        <DollarSign className="w-4 h-4" />
                                        <span>$1.200</span>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 text-gray-500 text-xs font-medium">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>2.5 km</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="self-center pl-2">
                                <form action={assignOrderToMe.bind(null, order.id)}>
                                    <button 
                                        type="submit"
                                        className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                                        title="Aceptar Pedido"
                                    >
                                        <Navigation className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
