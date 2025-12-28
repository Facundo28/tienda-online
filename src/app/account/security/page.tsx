import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { TwoFactorSection } from "@/components/account/TwoFactorSection";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function SecurityPage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  
  if (!user) return null;

  const enabledMethods = user.enabled2FAMethods ? user.enabled2FAMethods.split(",") : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Seguridad y Acceso</h2>
        <p className="text-sm text-gray-500">
          Gestiona tus métodos de verificación en dos pasos.
        </p>
      </div>

      {/* 2FA Methods List */}
      <div className="space-y-4">
          <TwoFactorSection 
              method="APP" 
              title="Google Authenticator" 
              description="Usa una aplicación como Google Auth o Authy." 
              details="Genera códigos sin conexión."
              icon="https://upload.wikimedia.org/wikipedia/commons/6/6e/Google_Authenticator_for_Android_icon.svg"
              isEnabled={enabledMethods.includes("APP")} 
          />
          
          <TwoFactorSection 
              method="SMS" 
              title="Mensaje de Texto (SMS)" 
              description={`Recibe códigos al ${user.phoneCountryCode || "+54"} ${user.phone || "..."}`}
              details="Requiere señal celular." 
              isEnabled={enabledMethods.includes("SMS")}
              requiresPhone={!user.phone} 
          />

          <TwoFactorSection 
              method="EMAIL" 
              title="Email OTP" 
              description={`Recibe códigos a ${user.email}`}
              details="Puede demorar unos segundos." 
              isEnabled={enabledMethods.includes("EMAIL")} 
          />
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Contraseña
        </h3>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
