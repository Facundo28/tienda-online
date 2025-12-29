import { Toaster } from "sonner";
import { requireUser } from "@/lib/auth/session";
import { ShieldAlert, UserCheck } from "lucide-react";
import Link from "next/link";

export default async function LogisticsGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  if (!user.isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600 mb-8">
                Las herramientas logísticas son exclusivas para <strong>Partners Verificados</strong>. 
                Por favor, completa tu verificación de identidad o espera la aprobación de la administración.
            </p>

            <div className="space-y-3">
                <Link 
                    href="/account/security"
                    className="flex items-center justify-center gap-2 w-full bg-[#3483fa] text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors"
                >
                    <UserCheck className="w-5 h-5" />
                    Validar Identidad
                </Link>
                <Link 
                    href="/partner-request"
                    className="block w-full text-blue-600 font-medium py-3 hover:bg-blue-50 rounded-xl transition-colors"
                >
                    Requisitos para Partners
                </Link>
                <Link href="/" className="block text-gray-400 text-sm hover:text-gray-600">
                    Volver al Inicio
                </Link>
            </div>
        </div>
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {children}
      <Toaster richColors position="top-center" />
    </div>
  );
}
