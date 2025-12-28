import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { MapPin, ArrowRight } from "lucide-react";

export async function AvailableOrdersSection() {
    const user = await requireUser();
    
    // Find orders with NO courier, but meant for Delivery
    const pool = await prisma.order.findMany({
        where: {
            courierId: null,
            deliveryMethod: "DELIVERY",
            deliveryStatus: "PENDING", // Not delivered yet
            // In a real app, filter by Company or Geo
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    if (pool.length === 0) return null;

    async function acceptOrder(formData: FormData) {
        "use server";
        const orderId = formData.get("orderId") as string;
        const currentUser = await requireUser();
        
        await prisma.order.update({
            where: { id: orderId },
            data: {
                courierId: currentUser.id,
                deliveryStatus: "ASSIGNED" // Or ON_WAY
            }
        });
        revalidatePath("/delivery");
    }



    return (
        <div className="space-y-4">
            <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                Disponibles para ti
            </h2>
            <div className="grid gap-3">
                {pool.map(order => (
                    <div key={order.id} className="bg-white border-l-4 border-green-500 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-gray-900">{order.customerName}</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    {order.addressLine1}
                                </p>
                            </div>
                            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded">
                                NUEVO
                            </span>
                        </div>
                        <form action={acceptOrder}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <button className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700 shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
                                ACEPTAR ENVÍO <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                ))}
            </div>
        </div>
    );
}
