
import Image from "next/image";
import { requireUser } from "@/lib/auth/session";
import { updateProfile } from "../actions"; // Reusing existing action
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ProfileForm } from "./ProfileForm";

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
        <ProfileForm user={user} updateProfileAction={updateProfile} />
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
