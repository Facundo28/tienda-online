import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { adminToggleVerified, adminUpdateUser, adminResetPassword, adminDisable2FA } from "../actions";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireUser();
  if (admin.role !== "ADMIN") redirect("/");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) notFound();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Profile */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
        <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
            {user.avatarUrl ? (
                <img src={user.avatarUrl.startsWith("http") ? user.avatarUrl : `/${user.avatarUrl}`} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                    {user.name.charAt(0).toUpperCase()}
                </div>
            )}
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                {user.name}
                {user.isVerified && <VerifiedBadge className="w-6 h-6" />}
            </h1>
            <p className="text-gray-500">{user.email}</p>
            <div className="mt-2 flex gap-2">
                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                 }`}>
                    {user.role}
                 </span>
                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                 }`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                 </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Info Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-bold border-b pb-2">Editar Información</h2>
              <form action={adminUpdateUser} className="space-y-4">
                  <input type="hidden" name="userId" value={user.id} />
                  
                  <div>
                      <label className="text-sm font-medium text-gray-700">Nombre</label>
                      <input name="name" defaultValue={user.name} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-700">Email (Cuidado)</label>
                      <input name="email" defaultValue={user.email} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-700">Teléfono</label>
                      <input name="phone" defaultValue={user.phone || ""} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                   <div>
                      <label className="text-sm font-medium text-gray-700">Rol</label>
                      <select name="role" defaultValue={user.role} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                          <option value="USER">Usuario</option>
                          <option value="ADMIN">Administrador</option>
                      </select>
                  </div>
                  
                  <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold w-full hover:bg-gray-800">
                      Guardar Cambios
                  </button>
              </form>
          </div>

          {/* Security Actions */}
          <div className="space-y-6">
             {/* Verification Toggle */}
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                 <h2 className="text-lg font-bold border-b pb-2 mb-4">Verificación</h2>
                 <form className="flex items-center justify-between">
                     <span className="text-sm text-gray-600">Insignia de Verificado</span>
                     {/* We use a form with hidden input to invoke server action on submit or use bind */}
                     {user.isVerified ? (
                        <button 
                            formAction={async () => { "use server"; await adminToggleVerified(user.id, false) }}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm border border-red-200 hover:bg-red-100"
                        >
                            Quitar Insignia
                        </button>
                     ) : (
                        <button 
                             formAction={async () => { "use server"; await adminToggleVerified(user.id, true) }}
                             className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-sm border border-green-200 hover:bg-green-100"
                         >
                             Dar Insignia
                         </button>
                     )}
                 </form>
             </div>

             {/* Password Reset */}
             <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
                 <h2 className="text-lg font-bold border-b pb-2 mb-4 text-red-700">Zona de Seguridad</h2>
                 
                 <form action={adminResetPassword} className="space-y-4 mb-6">
                     <input type="hidden" name="userId" value={user.id} />
                     <div>
                        <label className="text-sm font-medium text-gray-700">Establecer Nueva Contraseña</label>
                        <div className="flex gap-2">
                            <input name="newPassword" placeholder="Nueva clave..." className="flex-1 border rounded-lg px-3 py-2 text-sm" required minLength={6} />
                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700">
                                Cambiar
                            </button>
                        </div>
                     </div>
                 </form>

                 <div className="border-t pt-4">
                     <div className="flex items-center justify-between">
                         <div>
                            <p className="font-medium text-sm">Autenticación de Dos Pasos (2FA)</p>
                            <p className="text-xs text-gray-500">
                                Métodos: {user.enabled2FAMethods || "Ninguno"}
                            </p>
                         </div>
                         <form action={async () => { "use server"; await adminDisable2FA(user.id) }}>
                             <button className="text-red-600 text-sm font-medium hover:underline disabled:opacity-50" disabled={!user.enabled2FAMethods}>
                                 Desactivar 2FA
                             </button>
                         </form>
                     </div>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
}
