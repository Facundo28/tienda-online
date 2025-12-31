import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, HelpCircle } from "lucide-react";

// Content Mapping
const helpContents: Record<string, { title: string; faqs: { q: string; a: string }[] }> = {
  "orders": {
    title: "Compras y Pedidos",
    faqs: [
      { q: "¿Cómo rastreo mi pedido?", a: "Ve a 'Mis Compras', selecciona el pedido y verás el estado en tiempo real." },
      { q: "¿Puedo cancelar una compra?", a: "Sí, siempre que el envío no esté en camino. Ve a 'Mis Compras' > 'Ayuda' > 'Cancelar'." },
      { q: "¿Cuánto tarda en llegar?", a: "Depende de tu ubicación. Normalmente entre 24 a 72 horas hábiles." }
    ]
  },
  "payments": {
    title: "Pagos y Facturación",
    faqs: [
      { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos tarjetas de crédito, débito y transferencias bancarias." },
      { q: "¿Es seguro pagar?", a: "Sí, usamos encriptación de grado bancario para proteger tus datos." },
      { q: "¿Dónde veo mis facturas?", a: "Te enviamos la factura a tu email tras confirmar la compra." }
    ]
  },
  "shipping": {
    title: "Envíos y Entregas",
    faqs: [
      { q: "¿Hacen envíos a todo el país?", a: "Sí, cubrimos todo el territorio nacional." },
      { q: "¿Puedo cambiar la dirección?", a: "Solo si el vendedor no ha despachado el producto. Contáctalo inmediatamente." },
      { q: "¿Qué pasa si no estoy en casa?", a: "El correo hará un segundo intento. Si falla, deberás retirarlo en sucursal." }
    ]
  },
  "returns": {
    title: "Cambios y Devoluciones",
    faqs: [
      { q: "¿Tengo garantía?", a: "Sí, tienes 30 días de cobertura de compra protegida." },
      { q: "¿Cómo devuelvo un producto?", a: "Inicia un reclamo desde el detalle de la compra para recibir una etiqueta de devolución gratis." }
    ]
  }
};

export default async function HelpCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const content = helpContents[category];

  if (!content) return notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 min-h-screen">
      <Link href="/help" className="inline-flex items-center text-gray-500 hover:text-[#12753e] mb-8 font-medium">
        <ChevronLeft className="w-5 h-5 mr-1" />
        Volver al Centro de Ayuda
      </Link>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-[#12753e]">
                <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
        </div>

        <div className="space-y-6">
          {content.faqs.map((faq, i) => (
            <div key={i} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 mb-4">¿No encontraste lo que buscabas?</p>
        <Link href="/contact" className="text-[#12753e] font-bold hover:underline">
            Contactar a soporte técnico
        </Link>
      </div>
    </div>
  );
}
