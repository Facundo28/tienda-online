import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteWorkerAction, toggleWorkerStatusAction } from "../actions";
import { Plus, ArrowLeft, Edit, Trash2, User, Phone, CheckCircle, XCircle, MapPin } from "lucide-react";

export default async function DriversListPage() {
  const user = await requireUser();
  const company = await prisma.logisticsCompany.findUnique({
      where: { ownerId: user.id },
      include: { workers: true }
  });

  if (!company) redirect("/");

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold">Conductores de {company.name}</h1>
         <div className="flex gap-2">
            <Link href="/logistics#new-driver" className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 flex items-center gap-2">
               <Plus className="w-4 h-4" /> <span>Nuevo</span>
            </Link>
            <Link href="/logistics" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2">
               <ArrowLeft className="w-4 h-4" /> <span>Volver</span>
            </Link>
         </div>
      </div>

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
                               <div className="flex flex-col gap-1.5">
                                   <a href={`tel:${worker.phone}`} className="text-sm font-mono text-gray-600 flex items-center gap-2 hover:text-[#12753e] transition-colors group/phone">
                                       <Phone className="w-3 h-3 group-hover/phone:text-[#12753e]" />
                                       {worker.phone || '-'}
                                   </a>
                                   <a 
                                     href={`https://www.google.com/maps?q=-34.6037,-58.3816`} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="text-[11px] font-medium text-blue-600 flex items-center gap-1.5 hover:underline bg-blue-50 w-fit px-2 py-0.5 rounded-md"
                                     title="Ver última ubicación (Simulado)"
                                   >
                                       <MapPin className="w-3 h-3" />
                                       Ubicación actual
                                   </a>
                               </div>
                           </td>
                           <td className="p-5">
                                <form action={async () => {
                                    "use server";
                                    await toggleWorkerStatusAction(worker.id, !worker.isActive);
                                }}>
                                   <button className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide cursor-pointer hover:opacity-80 transition-opacity ${worker.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                       {worker.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                       {worker.isActive ? 'ACTIVO' : 'INACTIVO'}
                                   </button>
                                </form>
                           </td>
                           <td className="p-5 text-right flex items-center justify-end gap-2">
                               <Link 
                                  href={`/logistics/drivers/${worker.id}`}
                                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Editar"
                               >
                                   <Edit className="w-4 h-4" />
                               </Link>
                               
                               <form action={async () => {
                                   "use server";
                                   if(confirm("¿Eliminar conductor de la flota?")) {
                                       await deleteWorkerAction(worker.id);
                                   }
                               }}>
                                   <button className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors" title="Desvincular">
                                       <Trash2 className="w-4 h-4" />
                                   </button>
                               </form>
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
           {company.workers.length === 0 && (
               <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                   <User className="w-12 h-12 mb-4 opacity-20" />
                   <p className="text-lg font-medium text-gray-600">No hay conductores registrados.</p>
               </div>
           )}
       </div>
    </div>
  );
}
