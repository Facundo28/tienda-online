import Link from "next/link";
import { Check, Truck, ShieldCheck, FileText, AlertTriangle, Rocket, DollarSign, MapPin } from "lucide-react";

export default function PartnerRequestPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Conviértete en Partner Logístico</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Únete a la red de distribución más segura de Market Online. Buscamos flotas y conductores comprometidos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Requirements List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#12753e]" />
                Requisitos Excluyentes
            </h2>
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                        <Truck className="w-5 h-5 text-gray-400" />
                        Vehículo
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 ml-7">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Cédula Verde / Azul vigente.</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> VTV o RTO al día.</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Seguro Automotor Vigente.</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Antigüedad máxima 15 años.</li>
                    </ul>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        Documentación
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 ml-7">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> CUIT / Monotributo activo.</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Certificado de Antecedentes Penales.</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Licencia de Conducir (Clase Prof. preferente).</li>
                    </ul>
                </div>
            </div>
            
            <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800">
                    Solo aceptamos conductores que puedan facturar sus servicios y cumplan con todas las normativas locales de transporte.
                </p>
            </div>
        </div>

        {/* Action / Contact */}
        <div className="space-y-8">
            <div className="bg-[#12753e] rounded-2xl p-8 text-white text-center shadow-lg">
                <h3 className="text-2xl font-bold mb-4">¿Tienes todo listo?</h3>
                <p className="text-green-100 mb-8">
                    Si cumples con los requisitos, envíanos tu postulación para comenzar el proceso de alta y verificación manual.
                </p>
                <a 
                    href="mailto:partners@marketonline.com?subject=Solicitud Alta Partner Logistico"
                    className="block w-full bg-white text-[#12753e] font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                >
                    Enviar Documentación
                </a>
                <p className="mt-4 text-xs text-green-200">
                    Te responderemos en un plazo de 48hs hábiles.
                </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">¿Por qué Market Online?</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex gap-2">
                        <Rocket className="w-5 h-5 text-[#12753e]" />
                        <span>Alta demanda de envíos diarios en tu zona.</span>
                    </li>
                    <li className="flex gap-2">
                        <DollarSign className="w-5 h-5 text-[#12753e]" />
                        <span>Pagos semanales transparentes.</span>
                    </li>
                    <li className="flex gap-2">
                        <MapPin className="w-5 h-5 text-[#12753e]" />
                        <span>Rutas optimizadas inteligentes.</span>
                    </li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
}
