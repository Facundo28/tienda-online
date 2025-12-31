import { requireUser } from "@/lib/auth/session";
import { PremiumProfileEditor } from "@/components/PremiumProfileEditor";
import { Star } from "lucide-react";

export default async function PremiumPage() {
  const user = await requireUser();

  const isPremium = user.membershipExpiresAt && user.membershipExpiresAt > new Date();

  return (
    <div className="space-y-6">
       <div>
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
                Mi Página Premium
            </h2>
            <a href="/account" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Volver
            </a>
        </div>
        <p className="text-sm text-gray-500">
          Personaliza tu perfil de vendedor para destacar entre la competencia.
        </p>
      </div>

      {isPremium ? (
          <PremiumProfileEditor user={user} />
      ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-10 h-10 text-yellow-600 fill-current" />
              </div>
              <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Actualiza a Premium</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                      Destaca tu perfil con un banner personalizado, enlaces a tus redes sociales y tu propio sitio web.
                  </p>
              </div>
              <button disabled className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold opacity-50 cursor-not-allowed">
                  Próximamente: Suscripción Automática
              </button>
              <p className="text-xs text-gray-400">
                  Por ahora, contacta a soporte para activar tu membresía.
              </p>
          </div>
      )}
    </div>
  );
}
