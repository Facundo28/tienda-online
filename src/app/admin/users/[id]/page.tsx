import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { adminToggleVerified, adminUpdateUser, adminResetPassword, adminDisable2FA } from "../actions";
import { AlertTriangle, Save, Truck, ShieldCheck, Info, ShoppingBag, Tag, MessageSquare, Star, Upload, Camera, FileText, CheckCircle2 } from "lucide-react";

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
    include: {
        orders: { orderBy: { createdAt: 'desc' }, take: 5 },
        products: { orderBy: { createdAt: 'desc' }, take: 5 },
        companyOwned: true,
        workerOf: true,
        sessions: { orderBy: { expiresAt: 'desc' } },
        assignedOrders: { 
            where: { deliveryStatus: { not: 'DELIVERED' } },
            include: { user: true } // buyer info
        },
        reviews: { orderBy: { createdAt: 'desc' }, take: 5 },
        questions: { orderBy: { createdAt: 'desc' }, take: 5, include: { product: true } }
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMN 1: EDIT PROFILE (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                  <h2 className="text-lg font-bold border-b pb-2 flex items-center justify-between">
                      <span>Editar Información</span>
                      {user.avatarUrl && <span className="text-xs text-green-600 font-normal">Foto de perfil detectada</span>}
                  </h2>
                  <form action={adminUpdateUser} className="space-y-4">
                      <input type="hidden" name="userId" value={user.id} />
                      
                      <div className="flex flex-col sm:flex-row gap-6">
                          {/* Avatar Input */}
                          <div className="shrink-0 flex flex-col items-center gap-2">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200 group cursor-pointer shadow-sm">
                                    {user.avatarUrl ? (
                                        <img 
                                            src={user.avatarUrl.startsWith("http") ? user.avatarUrl : (user.avatarUrl.startsWith("/") ? user.avatarUrl : `/${user.avatarUrl}`)} 
                                            className="w-full h-full object-cover" 
                                            alt="Avatar"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400 bg-gray-50">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                    <input type="file" name="avatar" className="absolute inset-0 opacity-0 cursor-pointer" title="Cambiar foto de perfil" accept="image/*" />
                                </div>
                                <p className="text-[10px] text-gray-400 text-center max-w-[100px]">Click para subir nueva imagen</p>
                          </div>

                          {/* Text Inputs */}
                          <div className="flex-1 space-y-4">
                              <div>
                                  <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                                  <input name="name" defaultValue={user.name} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-sm font-medium text-gray-700">Email</label>
                                      <input name="email" defaultValue={user.email} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" />
                                  </div>
                                  <div>
                                      <label className="text-sm font-medium text-gray-700">Teléfono</label>
                                      <input name="phone" defaultValue={user.phone || ""} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="+54 9..." />
                                  </div>
                              </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                       <label className="text-sm font-medium text-gray-700">Rol de Usuario</label>
                                      <select name="role" defaultValue={user.role} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                                          <option value="USER">Usuario (Comprador)</option>
                                          <option value="ADMIN">Administrador (God)</option>
                                          <option value="LOGISTICS_ADMIN">Dueño de Logística</option>
                                          <option value="DRIVER">Repartidor</option>
                                      </select>
                                  </div>
                                   <div>
                                      <label className="text-sm font-medium text-gray-700">DNI / CUIT</label>
                                      <input name="dni" defaultValue={user.dni || ""} placeholder="Documento" className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
                                  </div>
                              </div>
                          </div>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-100">
                          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                             <Info className="w-4 h-4 text-blue-600" />
                             Documentación de Identidad (KYC)
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                               {[
                                   { label: "Frente DNI", name: "documentFront", url: user.documentFrontUrl },
                                   { label: "Dorso DNI", name: "documentBack", url: user.documentBackUrl },
                                   { label: "Selfie", name: "identitySelfie", url: user.identitySelfieUrl }
                               ].map((doc) => (
                                   <div key={doc.name} className="space-y-2">
                                       <div className="border border-dashed border-gray-300 rounded-lg h-24 relative group overflow-hidden bg-gray-50 hover:bg-white transition-colors">
                                            {doc.url ? (
                                                <img src={doc.url} className="w-full h-full object-cover opacity-90 group-hover:opacity-50 transition-opacity" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                    <span className="text-[10px] text-center px-1 font-medium">{doc.label}</span>
                                                    <span className="text-[9px]">Vacío</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <span className="text-[9px] font-bold bg-white shadow px-2 py-1 rounded flex items-center gap-1">
                                                    <Camera className="w-3 h-3" /> CAMBIAR
                                                 </span>
                                            </div>
                                            <input type="file" name={doc.name} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                       </div>
                                       {doc.url && <a href={doc.url} target="_blank" className="text-[10px] text-center block text-blue-600 hover:underline">Ver</a>}
                                   </div>
                               ))}
                          </div>
                      </div>
                      
                      <div className="pt-2">
                           <button className="bg-black text-white px-4 py-3 rounded-lg text-sm font-bold w-full hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                               <Save className="w-4 h-4" />
                               <span>Guardar Cambios del Perfil</span>
                           </button>
                      </div>
                  </form>
              </div>
          </div>

          {/* COLUMN 2: SECURITY & ACTIONS (1/3 width) */}
          <div className="space-y-6">
                 {/* Verification Toggle */}
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                     <h2 className="text-lg font-bold border-b pb-2 mb-4 flex items-center gap-2">
                         <VerifiedBadge className="w-5 h-5" />
                         Estado de Verificación
                     </h2>
                     <div className="flex flex-col items-center justify-center text-center py-4">
                         <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${user.isVerified ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {user.isVerified ? <VerifiedBadge className="w-8 h-8" /> : (
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                              )}
                         </div>
                         <p className="font-medium text-gray-900 mb-1">{user.isVerified ? 'Usuario Verificado' : 'No Verificado'}</p>
                         <p className="text-xs text-gray-500 mb-6 px-4">
                             {user.isVerified 
                                ? "Este usuario tiene acceso completo y la insignia azul." 
                                : "Este usuario tiene restricciones en checkout y logística."}
                         </p>
                         
                         <form className="w-full">
                             {user.isVerified ? (
                                <button 
                                    formAction={async () => { "use server"; await adminToggleVerified(user.id, false) }}
                                    className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-200 hover:bg-red-100 font-medium transition-colors"
                                >
                                    Revocar Verificación
                                </button>
                             ) : (
                                <button 
                                     formAction={async () => { "use server"; await adminToggleVerified(user.id, true) }}
                                     className="w-full bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm border border-green-200 hover:bg-green-100 font-medium transition-colors"
                                 >
                                     Aprobar Verificación
                                 </button>
                             )}
                         </form>
                     </div>
                 </div>

                 {/* Password Reset */}
                 <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6 overflow-hidden relative">
                     <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                     <h2 className="text-lg font-bold border-b pb-2 mb-4 text-red-700 relative z-10 flex items-center gap-2">
                         <ShieldCheck className="w-5 h-5" />
                         Seguridad
                     </h2>
                     
                     <form action={adminResetPassword} className="space-y-3 relative z-10">
                         <input type="hidden" name="userId" value={user.id} />
                         <div>
                            <label className="text-xs font-bold text-red-800 uppercase tracking-wide mb-1 block">Resetear Contraseña</label>
                            <div className="flex gap-2">
                                <input name="newPassword" placeholder="Nueva..." className="flex-1 border rounded px-3 py-1.5 text-xs bg-red-50/50" required minLength={6} />
                                <button className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700 shadow-sm">
                                    Ok
                                </button>
                            </div>
                         </div>
                     </form>

                     <div className="border-t pt-4 mt-4 relative z-10">
                         <div className="flex items-center justify-between">
                             <div>
                                <p className="font-bold text-xs text-gray-700">Autenticación 2FA</p>
                                <p className="text-[10px] text-gray-500">
                                    {user.enabled2FAMethods ? "ACTIVO" : "INACTIVO"}
                                </p>
                             </div>
                             <form action={async () => { "use server"; await adminDisable2FA(user.id) }}>
                                 <button className="text-red-500 hover:text-red-700 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed" disabled={!user.enabled2FAMethods}>
                                     DESACTIVAR
                                 </button>
                             </form>
                         </div>
                     </div>
                 </div>

                 {/* Membership Control */}
                 <div className="bg-white rounded-xl border border-yellow-200 shadow-sm p-6 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full -mr-12 -mt-12 z-0"></div>
                     <h2 className="text-lg font-bold border-b pb-2 mb-4 text-yellow-800 relative z-10 flex items-center gap-2">
                         <Star className="w-5 h-5" />
                         Membresía Premium
                     </h2>

                     <div className="relative z-10 text-center space-y-4">
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                             <p className="text-xs text-yellow-800 uppercase font-bold mb-1">Estado Actual</p>
                             {user.membershipExpiresAt && user.membershipExpiresAt > new Date() ? (
                                 <div>
                                     <p className="text-lg font-bold text-green-600">ACTIVA</p>
                                     <p className="text-xs text-gray-500">Vence: {user.membershipExpiresAt.toLocaleDateString()}</p>
                                 </div>
                             ) : (
                                 <div>
                                     <p className="text-lg font-bold text-gray-400">INACTIVA</p>
                                     <p className="text-xs text-gray-500">Usuario Free Tier</p>
                                 </div>
                             )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <form action={async () => { "use server"; await import("../actions").then(m => m.adminUpdateMembership(user.id, 1)); }}>
                                <button className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-2 rounded-lg text-xs transition-colors">
                                    +1 Mes
                                </button>
                            </form>
                            <form action={async () => { "use server"; await import("../actions").then(m => m.adminUpdateMembership(user.id, 12)); }}>
                                <button className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 rounded-lg text-xs transition-colors">
                                    +1 Año
                                </button>
                            </form>
                        </div>
                     </div>
                 </div>
          </div>
      </div>


      {/* EXTENDED INFO (God Mode) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Orders History */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold border-b pb-2 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gray-400" />
                  Últimas Compras
              </h2>
              {(user as any).orders?.length > 0 ? (
                  <div className="space-y-3">
                      {(user as any).orders.map((order: any) => (
                          <div key={order.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                              <div>
                                  <div className="font-medium">Pedido #{order.id.slice(-8)}</div>
                                  <div className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</div>
                              </div>
                              <div className="text-right">
                                  <div className="font-medium">${(order.totalCents / 100).toFixed(2)}</div>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                      order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>{order.status}</span>
                              </div>
                              <a href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline text-xs">Ver</a>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-gray-500 text-sm">Sin compras registradas.</p>
              )}
          </div>

          {/* Products Selling */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold border-b pb-2 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-gray-400" />
                  Productos Publicados
              </h2>
               {(user as any).products?.length > 0 ? (
                  <div className="space-y-3">
                      {(user as any).products.map((product: any) => (
                          <div key={product.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                              <div className="flex items-center gap-2">
                                  {product.imageUrl && (
                                     <img src={product.imageUrl.split('\n')[0]} className="w-8 h-8 rounded object-cover bg-gray-100" />
                                  )}
                                  <div className="truncate max-w-[150px]">
                                      <div className="font-medium truncate">{product.name}</div>
                                      <div className="text-gray-500 text-xs">{product.isActive ? 'Activo' : 'Pausado'}</div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="font-medium">${(product.priceCents / 100).toFixed(2)}</div>
                              </div>
                              <a href={`/products/${product.id}`} target="_blank" className="text-blue-600 hover:underline text-xs">Ver</a>
                          </div>
                      ))}
                      <a href={`/admin/products?q=${user.email}`} className="block text-center text-xs text-blue-600 hover:underline pt-2">Ver todos los productos</a>
                  </div>
              ) : (
                  <p className="text-gray-500 text-sm">Este usuario no vende productos.</p>
              )}
          </div>
      </div>

      {/* GOD MODE: DEEP DATA LAYERS */}
      <div className="space-y-8">
          
          {/* LAYER 1: LOGISTICS & WORK */}
          {(user.role === 'DRIVER' || user.role === 'LOGISTICS_ADMIN') && (
              <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6">
                  <h2 className="text-lg font-bold border-b pb-2 mb-4 text-blue-800 flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Datos de Logística
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <h3 className="text-sm font-semibold text-gray-600 mb-2">Entregas Asignadas (Pendientes)</h3>
                          {(user as any).assignedOrders?.length > 0 ? (
                              <div className="space-y-2">
                                  {(user as any).assignedOrders.map((o: any) => (
                                      <div key={o.id} className="text-xs border p-2 rounded bg-blue-50 flex justify-between items-center">
                                          <span>Pedido #{o.id.slice(-8)}</span>
                                          <span className="font-bold">{o.deliveryStatus}</span>
                                          <a href={`/admin/orders/${o.id}`} className="text-blue-600 underline">Ver</a>
                                      </div>
                                  ))}
                              </div>
                          ) : <p className="text-xs text-gray-500">Sin entregas pendientes.</p>}
                      </div>
                      <div>
                          <h3 className="text-sm font-semibold text-gray-600 mb-2">Afiliación</h3>
                          {(user as any).workerOf ? (
                              <div className="text-sm">Trabaja para: <span className="font-bold">{(user as any).workerOf.name}</span></div>
                          ) : (user as any).companyOwned ? (
                              <div className="text-sm">Dueño de: <span className="font-bold">{(user as any).companyOwned.name}</span></div>
                          ) : <p className="text-xs text-gray-500">Sin empresa vinculada.</p>}
                      </div>
                  </div>
              </div>
          )}

          {/* LAYER 2: SECURITY SESSIONS */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-gray-800"></div>
               <h2 className="text-lg font-bold border-b pb-2 mb-4 flex items-center gap-2">
                   <ShieldCheck className="w-5 h-5 text-gray-600" />
                   Sesiones Activas
                   <span className="text-xs font-normal text-gray-500 ml-2">({(user as any).sessions?.length || 0})</span>
               </h2>
               <div className="overflow-x-auto">
                   <table className="w-full text-xs text-left">
                       <thead className="bg-gray-50 text-gray-600">
                           <tr>
                               <th className="p-2">ID Sesión</th>
                               <th className="p-2">Expira</th>
                               <th className="p-2">Creada</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y">
                           {(user as any).sessions?.map((s: any) => (
                               <tr key={s.id}>
                                   <td className="p-2 font-mono text-gray-500">{s.id}</td>
                                   <td className="p-2">{new Date(s.expiresAt).toLocaleDateString()}</td>
                                   <td className="p-2">{new Date(s.createdAt).toLocaleDateString()}</td>
                               </tr>
                           ))}
                           {!(user as any).sessions?.length && <tr><td colSpan={3} className="p-4 text-center text-gray-400">Todo limpio (Sin sesiones activas)</td></tr>}
                       </tbody>
                   </table>
               </div>
          </div>

          {/* LAYER 3: BEHAVIOR (Questions & Reviews) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-sm font-bold uppercase text-gray-500 mb-4">Últimas Preguntas Realizadas</h2>
                  {(user as any).questions?.length > 0 ? (
                      <ul className="space-y-3">
                          {(user as any).questions.map((q: any) => (
                              <li key={q.id} className="text-xs group">
                                  <div className="italic text-gray-600">"{q.text}"</div>
                                  <div className="text-gray-400 mt-1 flex justify-between">
                                      <span>en {q.product.name}</span>
                                      <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                                  </div>
                              </li>
                          ))}
                      </ul>
                  ) : <p className="text-xs text-gray-400">Usuario silencioso.</p>}
              </div>

               <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-sm font-bold uppercase text-gray-500 mb-4">Últimas Reseñas Escritas</h2>
                  {(user as any).reviews?.length > 0 ? (
                      <ul className="space-y-3">
                          {(user as any).reviews.map((r: any) => (
                              <li key={r.id} className="text-xs">
                                  <div className="flex text-yellow-500 text-[10px] mb-1">
                                      <Star className="w-3 h-3 fill-current" />
                                      <span className="ml-1 text-gray-600 font-medium">{r.rating}/5</span>
                                  </div>
                                  <div className="text-gray-700">"{r.comment}"</div>
                              </li>
                          ))}
                      </ul>
                  ) : <p className="text-xs text-gray-400">Sin reseñas.</p>}
              </div>
          </div>



      </div>

    </div>
  );
}
