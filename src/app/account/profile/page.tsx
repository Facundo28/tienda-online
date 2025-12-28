
import Image from "next/image";
import { requireUser } from "@/lib/auth/session";
import { updateProfile } from "../actions"; // Reusing existing action
import { VerifiedBadge } from "@/components/VerifiedBadge";

export const dynamic = "force-dynamic";

function normalizeImageSrc(src: string) {
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return src;
  return `/${src}`;
}

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                Datos Personales
                {user.isVerified && <VerifiedBadge />}
            </h2>
            <a href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Volver
            </a>
        </div>
        <p className="text-sm text-gray-500">
          Actualiza tu información básica y tu foto de perfil.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form className="mt-6 grid gap-6" action={updateProfile}>
          
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-gray-50 ring-2 ring-white shadow">
              {user.avatarUrl ? (
                <Image
                  src={normalizeImageSrc(user.avatarUrl)}
                  alt={user.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={normalizeImageSrc(user.avatarUrl).startsWith("/uploads/")}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-gray-400">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 mb-1">Foto de Perfil</label>
              <div className="flex items-center gap-3">
                  <input
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#12753e]/10 file:text-[#12753e] hover:file:bg-[#12753e]/20 cursor-pointer"
                    type="file"
                    name="avatar"
                    accept="image/png,image/jpeg,image/webp"
                  />
              </div>
              <p className="mt-1 text-xs text-gray-500">Recomendado: 400x400px. Máx 5MB.</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="name">
                  Nombre Completo
                </label>
                <input
                  id="name"
                  name="name"
                  defaultValue={user.name}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#12753e] focus:border-[#12753e]"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="email">
                  Email (Cuenta)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  readOnly
                  title="Para cambiar tu email contáctanos"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="CustomerPhone">
                  Teléfono
                </label>
                <div className="flex gap-2">
                    <select
                        name="phoneCountryCode"
                        defaultValue={user.phoneCountryCode || "+54"}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#12753e] focus:border-[#12753e] bg-gray-50 max-w-[100px]"
                    >
                        <option value="+54">🇦🇷 +54</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+55">🇧🇷 +55</option>
                        <option value="+56">🇨🇱 +56</option>
                        <option value="+57">🇨🇴 +57</option>
                        <option value="+58">🇻🇪 +58</option>
                        <option value="+598">🇺🇾 +598</option>
                        <option value="+595">🇵🇾 +595</option>
                        <option value="+51">🇵🇪 +51</option>
                        <option value="+34">🇪🇸 +34</option>
                    </select>
                    <input
                      id="CustomerPhone"
                      name="customerPhone"
                      defaultValue={user.phone ?? ""}
                      placeholder="11 1234 5678"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#12753e] focus:border-[#12753e]"
                    />
                  </div>
               </div>
          </div>
           


          <div className="flex justify-end pt-4 border-t border-gray-100">
             <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-shadow shadow-sm"
              >
                Guardar Cambios
              </button>
          </div>
        </form>
      </div>

     {/* Info Banner */}
     <div className="rounded-lg bg-blue-50 p-4 flex items-start gap-3 text-blue-800">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mt-0.5 flex-shrink-0">
             <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
         </svg>
         <div className="text-sm">
             <p className="font-semibold">Información Importante</p>
             <p className="opacity-90 mt-1">Tu email se usa para iniciar sesión y enviarte notificaciones de compra. Si necesitas cambiarlo por seguridad, contacta a soporte.</p>
         </div>
     </div>


    </div>
  );
}
