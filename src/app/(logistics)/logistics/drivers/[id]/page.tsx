import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { updateWorkerAction } from "../actions";
import { ArrowLeft, Save } from "lucide-react";

export default async function EditDriverPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  // Verificar propiedad
  const company = await prisma.logisticsCompany.findUnique({
      where: { ownerId: user.id }
  });

  if (!company) redirect("/");

  const worker = await prisma.user.findUnique({
      where: { id }
  });

  if (!worker || worker.workerOfId !== company.id) {
      return notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4">
            <Link href="/logistics/drivers" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Editar Conductor</h1>
        </div>

        <div className="bg-white border p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4 mb-8 border-b pb-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500">
                    {worker.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-lg font-bold">{worker.name}</h2>
                    <p className="text-gray-500 text-sm">{worker.email}</p>
                    <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${worker.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {worker.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            </div>

            <form action={updateWorkerAction} className="space-y-6">
                <input type="hidden" name="workerId" value={worker.id} />
                
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nombre Completo</label>
                    <input 
                        name="name" 
                        defaultValue={worker.name}
                        required 
                        className="w-full bg-gray-50 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Teléfono</label>
                        <input 
                            name="phone" 
                            defaultValue={worker.phone || ""}
                            className="w-full bg-gray-50 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Email</label>
                        <input 
                            name="email" 
                            type="email"
                            defaultValue={worker.email}
                            required
                            className="w-full bg-gray-50 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                </div>

                <div className="pt-6 flex gap-3">
                    <Link href="/logistics/drivers" className="flex-1 bg-gray-100 text-gray-700 text-center py-3 rounded-xl font-bold hover:bg-gray-200">
                        Cancelar
                    </Link>
                    <button className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 shadow-lg flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" />
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}
