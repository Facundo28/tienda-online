import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserX, ShieldAlert, Truck, Building2, User, Ban, DollarSign, Package, MapPin, Eye, Activity, Save, CheckCircle2 } from "lucide-react";
import { CompanyEditForm } from "./CompanyEditForm";
import { adminDismissWorker, adminBanWorker, getCompanyStats, adminVerifyCompany } from "../actions";
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

  // Fetch Stats & Operations
  const stats = await getCompanyStats(company.id);
  
  // Fetch "Live" Orders (assigned to workers of this company, not delivered)
  const activeOrders = await prisma.order.findMany({
      where: {
          courier: {
              workerOfId: company.id
          },
          deliveryStatus: {
              in: ['PENDING', 'READY_TO_PICKUP', 'ASSIGNED', 'ON_WAY']
          }
      },
      include: {
          courier: true,
          user: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
                <Link href="/admin/companies" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                   <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                       {company.name}
                       {company.isVerified && <div className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Verificado</div>}
                   </h1>
                   <p className="text-gray-500 flex items-center gap-2 text-sm mt-1">
                       <Building2 className="w-3 h-3" /> {company.id}
                   </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 <form action={async () => {
                    "use server";
                    await adminVerifyCompany(company.id, !company.isVerified);
                 }}>
                    <button className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border
                        ${company.isVerified 
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}
                    `}>
                        {company.isVerified ? 'Revocar Verificación' : 'Aprobar Empresa'}
                    </button>
                 </form>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* COLUMN 1: EDIT & FLEET (2/3) */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* 1. Edit Section */}
                <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Save className="w-5 h-5 text-blue-600" />
                        Datos de la Empresa
                    </h2>
                    <CompanyEditForm company={company} />
                </section>

                {/* 2. Fleet Management */}
                <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-green-600"></div>
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-green-600" />
                            Flota de Conductores ({company.workers.length})
                        </h2>
                     </div>
                     
                     <div className="space-y-3">
                        {company.workers.length === 0 ? (
                            <p className="text-gray-400 italic text-sm text-center py-4 bg-gray-50 rounded-lg">No hay conductores asociados.</p>
                        ) : (
                            company.workers.map((worker: any) => (
                                <div key={worker.id} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-100 group transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 border flex items-center justify-center font-bold text-gray-500 relative">
                                            {worker.name.charAt(0)}
                                            {!worker.isActive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full" title="Baneado"></div>}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                                {worker.name}
                                                {!worker.isActive && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded-sm uppercase font-bold">Baneado</span>}
                                            </div>
                                            <div className="text-xs text-gray-500">{worker.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <Link href={`/admin/users/${worker.id}`} className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-black font-medium flex items-center gap-1">
                                            <Eye className="w-3 h-3" /> Ver
                                        </Link>
                                        
                                        <div className="h-4 w-px bg-gray-200 mx-1"></div>

                                        <form action={async () => {
                                            "use server";
                                            await adminDismissWorker(worker.id);
                                        }}>
                                            <button className="text-gray-400 hover:text-orange-600 hover:bg-orange-50 p-2 rounded-lg transition-colors" title="Desvincular (Expulsar de Flota)">
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        </form>

                                        <form action={async () => {
                                            "use server";
                                            await adminBanWorker(worker.id);
                                        }}>
                                            <button className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Banear de la Plataforma">
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

            {/* COLUMN 2: STATS & SIDEBAR (1/3) */}
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-700 rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ingresos (Est.)</p>
                            <h3 className="text-2xl font-bold text-gray-900 line-clamp-1" title={formatCurrencyFromCents(stats.revenue)}>
                                {formatCurrencyFromCents(stats.revenue)}
                            </h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Envíos Totales</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.orders}</h3>
                        </div>
                    </div>
                </div>

                {/* Owner Card */}
                <section className="bg-gradient-to-br from-gray-900 to-black text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldAlert className="w-24 h-24" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-400 uppercase mb-6 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        Dueño Responsable
                    </h2>
                    
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                         <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold border border-white/20 overflow-hidden">
                             {company.owner.avatarUrl ? (
                                <img src={company.owner.avatarUrl.startsWith("http") ? company.owner.avatarUrl : `/${company.owner.avatarUrl}`} className="w-full h-full object-cover" />
                             ) : (
                                <span>{company.owner.name.charAt(0)}</span>
                             )}
                         </div>
                         <div>
                             <div className="font-bold text-lg leading-tight">{company.owner.name}</div>
                             <div className="text-white/60 text-xs">{company.owner.email}</div>
                         </div>
                    </div>

                    <Link 
                        href={`/admin/users/${company.ownerId}`}
                        className="block w-full text-center bg-white text-black font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors text-xs uppercase tracking-wide"
                    >
                        Ver Perfil (God Mode)
                    </Link>
                </section>
                
                {/* Danger Zone */}
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                     <h3 className="text-xs font-bold text-red-800 uppercase mb-2">Zona Peligrosa</h3>
                     <p className="text-[10px] text-red-600 mb-3">Si eliminas la empresa, se perderá el historial y los choferes quedarán libres.</p>
                     <div className="flex justify-end">
                        <DeleteCompanyButton companyId={company.id} />
                     </div>
                </div>
            </div>
        </div>

        {/* BOTTOM: LIVE OPERATIONS */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Operaciones en Curso
                </h2>
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                    {activeOrders.length} Activas
                </span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">ID Pedido</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3">Conductor</th>
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-6 py-3 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {activeOrders.length > 0 ? (
                            activeOrders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-gray-500">#{order.id.slice(-8)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                            order.deliveryStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            order.deliveryStatus === 'ON_WAY' ? 'bg-blue-100 text-blue-800' : 
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {order.deliveryStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.courier ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                                                    {order.courier.name.charAt(0)}
                                                </div>
                                                <span className="truncate max-w-[120px]">{order.courier.name}</span>
                                            </div>
                                        ) : <span className="text-gray-400 italic">Sin asignar</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{order.user.name}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline text-xs font-bold">
                                            VER DETALLES
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                    No hay entregas activas en este momento.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>



    </div>
  );
}
