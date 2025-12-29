import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Save, Building2, User, Key, LogOut } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function LogisticsSettingsPage() {
    const user = await requireUser();

    if (user.role !== UserRole.LOGISTICS_ADMIN && user.role !== UserRole.ADMIN) {
        redirect("/");
    }

    const company = await prisma.logisticsCompany.findUnique({
        where: { ownerId: user.id }
    });

    if (!company) redirect("/logistics");

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
             <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/logistics" className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Configuración de Empresa</h1>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
                    
                    {/* Company Info Section */}
                    <section className="space-y-4">
                         <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                             <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                 <Building2 className="w-4 h-4" />
                             </div>
                             <h2 className="font-bold text-gray-800">Datos de la Empresa</h2>
                         </div>

                         <div className="grid gap-4">
                             <div>
                                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre Comercial</label>
                                 <input 
                                    defaultValue={company.name} 
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-700 font-medium" 
                                    disabled // Read only for now to keep it simple, or make a separate update action
                                 />
                                 <p className="text-xs text-gray-400 mt-1">Para modificar estos datos contacte a soporte.</p>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">CUIT</label>
                                     <input defaultValue={company.cuit} disabled className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-500" />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email de Contacto</label>
                                     <input defaultValue={company.email} disabled className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-500" />
                                 </div>
                             </div>
                         </div>
                    </section>

                    {/* Owner Info Section */}
                    <section className="space-y-4">
                         <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                             <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                 <User className="w-4 h-4" />
                             </div>
                             <h2 className="font-bold text-gray-800">Cuenta de Administrador</h2>
                         </div>

                         <div className="grid gap-4">
                            <div>
                                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre de Usuario</label>
                                 <input defaultValue={user.name} disabled className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-500" />
                            </div>
                            <Link href="/account/security" className="w-full p-4 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium">
                                <Key className="w-4 h-4" />
                                Cambiar Contraseña / Seguridad
                            </Link>
                         </div>
                    </section>

                    {/* Actions */}
                    <section className="pt-6 border-t border-gray-100">
                        <SignOutButton className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-xl shadow-none transition-all flex items-center justify-center gap-2" />
                    </section>

                </div>
             </div>
        </div>
    );
}
