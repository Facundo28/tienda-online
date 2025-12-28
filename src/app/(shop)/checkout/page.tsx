import { requireUser } from "@/lib/auth/session";
import { CheckoutClient } from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await requireUser();

  if (!user.isVerified) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-orange-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificación Requerida</h2>
        <p className="text-gray-600 mb-8">
          Para garantizar la seguridad de todas las operaciones, necesitas validar tu identidad antes de realizar compras.
        </p>
        <a 
          href="/account/security" 
          className="inline-flex items-center justify-center rounded-lg bg-[#3483fa] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-colors w-full sm:w-auto"
        >
          Validar mi Identidad
        </a>
        <p className="mt-6 text-xs text-gray-500">
          Solo te tomará unos minutos subir tu DNI y Selfie.
        </p>
      </div>
    );
  }

  return (
    <CheckoutClient
      initialForm={{
        customerName: user.name ?? "",
        customerEmail: user.email ?? "",
        customerPhone: user.phone ?? "",
        addressLine1: user.addressLine1 ?? "",
        addressLine2: user.addressLine2 ?? "",
        city: user.city ?? "",
        state: user.state ?? "",
        postalCode: user.postalCode ?? "",
      }}
    />
  );
}
