
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminClaimsPage() {
  await requireAdmin();

  const claims = await prisma.claim.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
        order: { select: { id: true, customerName: true } },
        user: { select: { name: true, email: true } }
    }
  });

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Gestión de Reclamos</h1>
                <p className="text-sm text-gray-500">Atención de disputas y devoluciones.</p>
            </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 border-b">
                    <tr>
                        <th className="px-6 py-4 font-semibold">ID Reclamo</th>
                        <th className="px-6 py-4 font-semibold">Usuario</th>
                        <th className="px-6 py-4 font-semibold">Pedido Afectado</th>
                        <th className="px-6 py-4 font-semibold">Motivo</th>
                        <th className="px-6 py-4 font-semibold">Estado</th>
                        <th className="px-6 py-4 font-semibold">Fecha</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {claims.length === 0 ? (
                        <tr><td colSpan={7} className="p-8 text-center text-gray-500">No hay reclamos activos.</td></tr>
                    ) : (
                        claims.map(claim => (
                            <tr key={claim.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-mono text-xs">{claim.id.slice(-8)}</td>
                                <td className="px-6 py-4">
                                     <div className="font-medium">{claim.user.name}</div>
                                     <div className="text-xs text-gray-500">{claim.user.email}</div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">#{claim.order.id.slice(-8)}</td>
                                <td className="px-6 py-4">{claim.type}</td>
                                <td className="px-6 py-4">
                                     <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                        claim.status === 'OPEN' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                     }`}>
                                        {claim.status}
                                     </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{new Date(claim.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-[#12753e] hover:underline text-xs font-medium">
                                        Gestionar
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
         </div>
       </div>
    </div>
  );
}
