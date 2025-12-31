"use server";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrencyFromCents } from "@/lib/money";

export default async function AdminClaimsPage() {
    const user = await requireUser();
    
    if (user.role !== 'ADMIN') {
        throw new Error("No autorizado");
    }

    const claims = await prisma.claim.findMany({
        where: { status: 'OPEN' },
        include: {
            order: { include: { user: true } },
            user: true // Claim requester
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Panel de Reclamos y Mediaciones</h1>
            
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-sm">Pedido</th>
                            <th className="p-4 font-semibold text-sm">Solicitante</th>
                            <th className="p-4 font-semibold text-sm">Motivo</th>
                            <th className="p-4 font-semibold text-sm">Fecha</th>
                            <th className="p-4 font-semibold text-sm">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {claims.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No hay reclamos pendientes.
                                </td>
                            </tr>
                        ) : claims.map((claim: any) => (
                            <tr key={claim.id} className="hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">#{claim.orderId.slice(-8)}</span>
                                </td>
                                <td className="p-4">
                                    <div className="font-medium">{claim.user.name}</div>
                                    <div className="text-xs text-gray-500">{claim.user.email}</div>
                                </td>
                                <td className="p-4 text-sm max-w-xs truncate">
                                    {claim.description}
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(claim.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <Link 
                                        href={`/orders/${claim.orderId}/chat`}
                                        className="bg-blue-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        Ver Caso
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
