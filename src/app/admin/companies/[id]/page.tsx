import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserX, ShieldAlert, Truck, Building2, User, Ban, DollarSign, Package } from "lucide-react";
import { CompanyEditForm } from "./CompanyEditForm";
import { adminDismissWorker, adminBanWorker, getCompanyStats } from "../actions";
import { DeleteCompanyButton } from "../DeleteCompanyButton";
import { formatCurrencyFromCents } from "@/lib/money";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");

  const { id } = await params;

  const company = await prisma.logisticsCompany.findUnique({
    where: { id },
    include: {
        owner: true,
        workers: true
    }
  });

  if (!company) notFound();

  // Fetch Stats
  const stats = await getCompanyStats(company.id);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/admin/companies" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                   <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                       {company.name}
                       {company.isVerified && <div className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Verificado</div>}
                   </h1>
                   <p className="text-gray-500 flex items-center gap-2 text-sm">
                       <Building2 className="w-3 h-3" /> {company.id}
                   </p>
                </div>
            </div>
            <DeleteCompanyButton companyId={company.id} />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-700 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-bold uppercase">Ingresos Totales (Est.)</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrencyFromCents(stats.revenue)}</h3>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                    <Package className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-bold uppercase">Envíos Completados</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.orders}</h3>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column: Edit & Fleet */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Edit Section */}
                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-600" />
                        Datos de la Empresa
                    </h2>
                    <CompanyEditForm company={company} />
                </section>

                {/* 3. Fleet Management */}
                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <User className="w-5 h-5 text-green-600" />
                            Flota de Conductores ({company.workers.length})
                        </h2>
                     </div>
                     
                     <div className="space-y-3">
                        {company.workers.length === 0 ? (
                            <p className="text-gray-400 italic text-sm">No hay conductores asociados.</p>
                        ) : (
                            company.workers.map(worker => (
                                <div key={worker.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center font-bold text-gray-500 relative">
                                            {worker.name.charAt(0)}
                                            {!worker.isActive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                                {worker.name}
                                                {!worker.isActive && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded-sm uppercase">Baneado</span>}
                                            </div>
                                            <div className="text-xs text-gray-500">{worker.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <Link href={`/admin/users/${worker.id}`} className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-black font-medium">
                                            God Mode
                                        </Link>
                                        
                                        <div className="h-4 w-px bg-gray-200 mx-1"></div>

                                        <form action={async () => {
                                            "use server";
                                            // Confirm handled by browser default if needed, or simple direct action for admin speed
                                            await adminDismissWorker(worker.id);
                                        }}>
                                            <button className="text-gray-400 hover:text-orange-500 hover:bg-orange-50 p-1.5 rounded-md transition-colors" title="Desvincular (Expulsar de Flota)">
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        </form>

                                        <form action={async () => {
                                            "use server";
                                            await adminBanWorker(worker.id);
                                        }}>
                                            <button className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Banear de la Plataforma (Desactivar Cuenta)">
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))
                        )}
                     </div>
                </section>

            </div>

            {/* Sidebar: Owner Info */}
            <div className="space-y-6">
                <section className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-6 shadow-lg">
                    <h2 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        Dueño Responsable
                    </h2>
                    
                    <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold">
                             {company.owner.name.charAt(0)}
                         </div>
                         <div>
                             <div className="font-bold text-lg">{company.owner.name}</div>
                             <div className="text-white/60 text-sm">{company.owner.email}</div>
                         </div>
                    </div>

                    <Link 
                        href={`/admin/users/${company.ownerId}`}
                        className="block w-full text-center bg-white text-black font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Ver Perfil (God Mode)
                    </Link>
                </section>
                
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                     <h3 className="text-xs font-bold text-red-800 uppercase mb-2">Zona Peligrosa</h3>
                     <p className="text-xs text-red-600 mb-3">Si eliminas la empresa, se perderá el historial y los choferes quedarán libres.</p>
                     <div className="flex justify-end">
                        <DeleteCompanyButton companyId={company.id} />
                     </div>
                </div>
            </div>
        </div>
    </div>
  );
}
