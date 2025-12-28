import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "./actions";

export default async function DriverProfilePage() {
  const user = await requireUser();

  const finishedOrders = await prisma.order.count({
      where: {
          courierId: user.id,
          deliveryStatus: "DELIVERED"
      }
  });

  return (
    <div className="space-y-6 pt-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                    {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                        Conductor Verificado
                    </span>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-800">{finishedOrders}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Envíos</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-800">5.0</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Calificación</p>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Link href="/account" className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100">
                <span className="font-medium text-gray-700">Editar Datos Personales</span>
                <span className="text-gray-400">→</span>
            </Link>
            <Link href="/account/security" className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100">
                <span className="font-medium text-gray-700">Seguridad (Contraseña / 2FA)</span>
                <span className="text-gray-400">→</span>
            </Link>
             <form action={logoutAction} className="p-4 hover:bg-red-50 transition-colors">
                <button className="w-full text-left text-red-600 font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                    </svg>
                    Cerrar Sesión
                </button>
            </form>
        </div>
    </div>
  );
}
