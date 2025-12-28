import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { adminVerifyCompany, adminDeleteCompany } from "./actions";
import { DeleteCompanyButton } from "./DeleteCompanyButton";
import Link from "next/link";
import { Eye } from "lucide-react";

export default async function AdminCompaniesPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");

  const companies = await prisma.logisticsCompany.findMany({
    include: {
        owner: true,
        workers: { select: { id: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Empresas de Logística</h1>
                <p className="text-gray-500">Verifica y gestiona las flotas de transporte.</p>
            </div>
            <div className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100">
                Total: <span className="font-bold">{companies.length}</span>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-gray-900">Empresa</th>
                        <th className="px-6 py-4 font-semibold text-gray-900">Dueño</th>
                        <th className="px-6 py-4 font-semibold text-gray-900">CUIT / Contacto</th>
                        <th className="px-6 py-4 font-semibold text-gray-900">Estado</th>
                        <th className="px-6 py-4 font-semibold text-gray-900 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {companies.map((company) => (
                        <tr key={company.id} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                                <div className="font-bold text-gray-900 text-lg">{company.name}</div>
                                <div className="text-xs text-gray-500">
                                    {company.workers.length} conductores registrados
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500">
                                        {company.owner.name.substring(0,2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{company.owner.name}</div>
                                        <div className="text-xs text-gray-500">{company.owner.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-mono text-gray-600">{company.cuit}</div>
                                <div className="text-xs text-gray-400">{company.phone}</div>
                            </td>
                            <td className="px-6 py-4">
                                <form action={async () => {
                                    "use server";
                                    // Toggle state
                                    await adminVerifyCompany(company.id, !company.isVerified);
                                }}>
                                    <button className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                                        ${company.isVerified 
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' 
                                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200'}
                                    `}>
                                        <span className={`w-2 h-2 rounded-full ${company.isVerified ? 'bg-green-600' : 'bg-yellow-600'}`}></span>
                                        {company.isVerified ? 'VERIFICADA' : 'PENDIENTE'}
                                    </button>
                                </form>
                            </td>
                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                <Link 
                                    href={`/admin/companies/${company.id}`}
                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                    title="Administrar"
                                >
                                    <Eye className="w-4 h-4" />
                                </Link>
                                <DeleteCompanyButton companyId={company.id} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {companies.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                    No hay empresas de logística registradas.
                </div>
            )}
        </div>
    </div>
  );
}
