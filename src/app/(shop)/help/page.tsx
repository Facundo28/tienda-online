import { Search, Package, ShieldCheck, User, CreditCard, Truck, ChevronRight, MessageCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Ayuda | Market E.C",
  description: "Centro de ayuda y soporte de Market E.C",
};

export default function HelpPage() {
  const categories = [
    {
      icon: Package,
      title: "Compras y Pedidos",
      desc: "Rastrear envíos, cancelar compras, devoluciones.",
      href: "/help/orders"
    },
    {
      icon: User,
      title: "Mi Cuenta",
      desc: "Configuración, seguridad, mis datos.",
      href: "/account"
    },
    {
      icon: CreditCard,
      title: "Pagos y Facturación",
      desc: "Métodos de pago, facturas, reembolsos.",
      href: "/help/payments"
    },
    {
      icon: Truck,
      title: "Envíos y Entregas",
      desc: "Costos, tiempos, cambios de domicilio.",
      href: "/help/shipping"
    },
    {
      icon: ShieldCheck,
      title: "Seguridad y Privacidad",
      desc: "Política de protección, reportar fraudes.",
      href: "/privacy"
    },
    {
      icon: MessageCircle,
      title: "Ventas",
      desc: "Cómo vender, gestionar publicaciones, cobros.",
      href: "/vender"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Search Section */}
      <section className="bg-[#12753e] py-16 px-4 text-center text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">¿Cómo podemos ayudarte?</h1>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar respuestas (ej: 'dónde está mi pedido')" 
              className="w-full h-14 pl-12 pr-4 rounded-full text-gray-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-green-400/30 transition-all text-lg placeholder:text-gray-400"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </section>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <Link 
              key={i} 
              href={cat.href}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 text-[#12753e] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <cat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#12753e] transition-colors">{cat.title}</h3>
              <p className="text-sm text-gray-500">{cat.desc}</p>
            </Link>
          ))}
        </div>

        {/* Quick FAQs Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-4">
             <FaqItem question="¿Cómo rastreo mi compra?">
                Entra a <Link href="/orders" className="text-[#12753e] font-bold underline">Mis Compras</Link>, busca tu pedido y selecciona "Seguir envío".
             </FaqItem>
             <FaqItem question="¿Puedo devolver un producto?">
                Sí, tienes 30 días de cobertura. Si el producto tiene un problema, puedes iniciar un reclamo desde el detalle de la compra.
             </FaqItem>
             <FaqItem question="¿Es seguro comprar en Market E.C?">
                Absolutamente. Protegemos tu dinero hasta que confirmas que recibiste el producto correctamente.
             </FaqItem>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-white rounded-2xl p-8 md:p-12 text-center border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿No encontraste lo que buscabas?</h3>
            <p className="text-gray-500 mb-6">Nuestro equipo de soporte está listo para ayudarte en lo que necesites.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-[#12753e] text-white px-8 py-3 rounded-full font-bold hover:bg-[#0e5c30] transition-all shadow-lg hover:shadow-green-900/20">
                <MessageCircle className="w-5 h-5" />
                Contactar Soporte
            </Link>
        </div>

      </div>
    </div>
  );
}

function FaqItem({ question, children }: { question: string, children: React.ReactNode }) {
  return (
    <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer">
      <summary className="flex items-center justify-between p-5 font-medium text-gray-900 list-none group-hover:bg-gray-50 transition-colors">
        {question}
        <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
      </summary>
      <div className="px-5 pb-5 text-gray-600 border-t border-gray-100 pt-4 text-sm leading-relaxed">
        {children}
      </div>
    </details>
  );
}
