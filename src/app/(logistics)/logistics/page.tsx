import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UnassignedOrders } from "./UnassignedOrders";
import { createWorkerAction, deleteWorkerAction, toggleWorkerStatusAction } from "./actions";
import { ShoppingBag, Package, UserPlus, Users } from "lucide-react";

export default async function LogisticsDashboard() {
  const user = await requireUser();

  if (user.role !== UserRole.LOGISTICS_ADMIN && user.role !== UserRole.ADMIN) {
     redirect("/");
  }


  const company = await prisma.logisticsCompany.findUnique({
      where: { ownerId: user.id },
      include: { 
          workers: {
              orderBy: { createdAt: 'desc' }
          }
      }
  });

  if (!company) {
      return (
          <div className="p-10 text-center">
              <h1 className="text-2xl font-bold text-red-600">No tienes una empresa registrada</h1>
              <p>Contacta a soporte para dar de alta tu flota.</p>
          </div>
      );
  }

   // Obtener Pedidos No Asignados (Solicitudes de envío de la tienda)
   const unassignedOrders = await prisma.order.findMany({
       where: {
           deliveryMethod: 'DELIVERY', // Envío Pendiente
           deliveryStatus: 'PENDING',  // Aún no asignado
           courierId: null             // Doble verificación
       },
       orderBy: { createdAt: 'asc' }
   });

   return (
    <div className="space-y-8 p-6 bg-gray-50/50 min-h-screen">
       {/* Cabecera Premium */}
       <header className="bg-gradient-to-r from-[#12753e] to-[#0e5c30] text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
           
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div>
                   <div className="flex items-center gap-3 mb-2">
                       <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/10">
                           Panel de Control
                       </span>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-mono bg-black/30 border border-white/10`}>
                           {company.isVerified ? 'VERIFICADO' : 'PENDIENTE'}
                       </span>
                       <Link href="/" className="ml-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/10 flex items-center gap-1 transition-colors">
                           <ShoppingBag className="w-3 h-3" /> Ir a la Tienda
                       </Link>
                   </div>
                   <h1 className="text-4xl font-bold mb-1 tracking-tight">{company.name}</h1>
                   <p className="text-emerald-100 flex items-center gap-2 text-lg">
                       <span className="opacity-70">Dueño:</span> 
                       <span className="font-semibold bg-white/10 px-2 rounded">{user.name}</span>
                   </p>
               </div>
               
               <div className="flex gap-4">
                   <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                       <div className="text-3xl font-bold mb-1">{company.workers.length}</div>
                       <div className="text-xs text-emerald-100 uppercase font-bold tracking-wider">Conductores</div>
                   </div>
                   <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                       <div className="text-3xl font-bold mb-1">{unassignedOrders.length}</div>
                       <div className="text-xs text-emerald-100 uppercase font-bold tracking-wider">Pendientes</div>
                   </div>
               </div>
           </div>
       </header>

       {/* Sección de Pedidos - Estilo Tarjeta */}
       <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                        <Package className="w-5 h-5" />
                   </div>
                   Pedidos por Asignar
                   <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{unassignedOrders.length}</span>
               </h2>
           </div>
           
           <UnassignedOrders 
                orders={unassignedOrders} 
                drivers={company.workers} 
           />
       </section>

       <div className="grid md:grid-cols-3 gap-8">
           {/* Formulario de Alta de Trabajador - Tarjeta Premium */}
           <div className="md:col-span-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 h-fit sticky top-6">
               <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-gray-800">
                   <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-[#12753e]">
                        <UserPlus className="w-5 h-5" />
                   </div>
                   Alta de Conductor
               </h3>
               
               <form action={createWorkerAction} className="space-y-5">
                   <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nombre Completo</label>
                       <input 
                            name="name" 
                            required 
                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#12753e] focus:border-[#12753e] outline-none transition-all" 
                            placeholder="Ej: Juan Perez" 
                        />
                   </div>
                   <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email (Usuario)</label>
                       <input 
                            name="email" 
                            type="email" 
                            required 
                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#12753e] focus:border-[#12753e] outline-none transition-all" 
                            placeholder="juan@flota.com" 
                        />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">DNI / Cédula</label>
                           <input 
                                name="dni" 
                                required 
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#12753e] outline-none" 
                                placeholder="12345678" 
                            />
                       </div>
                       <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Teléfono</label>
                           <input 
                                name="phone" 
                                required 
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#12753e] outline-none" 
                                placeholder="11..." 
                            />
                       </div>
                   </div>
                   
                   <button className="w-full bg-[#12753e] hover:bg-[#0e5c30] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <span>Registrar Conductor</span>
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                       </svg>
                   </button>
               </form>
           </div>

           {/* Workers List - Modern Table */}
           <div className="md:col-span-2 space-y-6">
               <div className="flex items-center justify-between">
                   <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                       <span className="w-2 h-8 bg-[#12753e] rounded-full"></span>
                       Tu Equipo
                   </h3>
                   <Link href="/logistics/drivers" className="text-sm font-medium text-[#12753e] hover:underline">Ver todos</Link>
               </div>

               {company.workers.length === 0 ? (
                   <div className="bg-white/50 p-12 rounded-3xl text-center text-gray-400 border-2 border-dashed border-gray-200">
                       <div className="mb-4 opacity-20 flex justify-center">
                           <Users className="w-16 h-16" />
                       </div>
                       <p className="text-lg font-medium text-gray-600">Aún no tienes conductores.</p>
                       <p className="text-sm">Registra el primero usando el formulario.</p>
                   </div>
               ) : (
                   <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                       <table className="w-full text-left">
                           <thead className="bg-gray-50/80 border-b border-gray-100">
                               <tr>
                                   <th className="p-5 font-bold text-gray-400 text-xs uppercase tracking-wider">Conductor</th>
                                   <th className="p-5 font-bold text-gray-400 text-xs uppercase tracking-wider">Contacto</th>
                                   <th className="p-5 font-bold text-gray-400 text-xs uppercase tracking-wider">Estado</th>
                                   <th className="p-5 font-bold text-gray-400 text-xs uppercase tracking-wider text-right">Acciones</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                               {company.workers.map((worker: any) => (
                                   <tr key={worker.id} className="hover:bg-gray-50/80 transition-colors group">
                                       <td className="p-5">
                                           <div className="flex items-center gap-4">
                                               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm">
                                                   {worker.name.substring(0,2).toUpperCase()}
                                               </div>
                                               <div>
                                                   <div className="font-bold text-gray-900">{worker.name}</div>
                                                   <div className="text-xs text-gray-500">{worker.email}</div>
                                               </div>
                                           </div>
                                       </td>
                                       <td className="p-5">
                                           <div className="text-sm font-mono text-gray-600">{worker.phone || '-'}</div>
                                       </td>
                                       <td className="p-5">
                                           <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${worker.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                               <span className={`w-1.5 h-1.5 rounded-full ${worker.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                               {worker.isActive ? 'ACTIVO' : 'INACTIVO'}
                                           </span>
                                       </td>
                                       <td className="p-5 text-right">
                                           <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#12753e] transition-colors">
                                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                           </button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
}
