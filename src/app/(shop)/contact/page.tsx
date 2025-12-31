import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contáctanos</h1>
        <p className="text-gray-600">Estamos aquí para ayudarte. Envíanos tus dudas o sugerencias.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6">Envíanos un mensaje</h2>
            <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Tu nombre" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="tu@email.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                    <textarea className="w-full border rounded-lg px-3 py-2 text-sm h-32" placeholder="¿En qué podemos ayudarte?"></textarea>
                </div>
                <button className="w-full bg-[#12753e] text-white font-medium py-2.5 rounded-lg hover:bg-green-700 transition">
                    Enviar Mensaje
                </button>
            </form>
        </div>

        <div className="space-y-8">
            <div>
                <h3 className="font-semibold text-lg mb-4">Información de Contacto</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Mail className="w-5 h-5 text-[#12753e]" />
                        <span>soporte@market-ec.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        <Phone className="w-5 h-5 text-[#12753e]" />
                        <span>+54 11 1234-5678</span>
                    </div>
                     <div className="flex items-center gap-3 text-gray-600">
                        <MapPin className="w-5 h-5 text-[#12753e]" />
                        <span>Av. Corrientes 1234, Buenos Aires</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
