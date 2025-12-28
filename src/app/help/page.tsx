export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Ayuda</h1>
      <p className="text-gray-600 mb-6">
        ¿En qué podemos ayudarte hoy?
      </p>
      
      <div className="grid gap-4">
        <details className="border p-4 rounded-lg cursor-pointer">
            <summary className="font-medium">¿Cómo comprar?</summary>
            <p className="mt-2 text-sm text-gray-500">Busca tu producto, agrégalo al carrito y sigue los pasos de pago.</p>
        </details>
        <details className="border p-4 rounded-lg cursor-pointer">
            <summary className="font-medium">¿Cómo vender?</summary>
            <p className="mt-2 text-sm text-gray-500">Ve a "Vender" en el menú, carga tu producto y listo.</p>
        </details>
         <details className="border p-4 rounded-lg cursor-pointer">
            <summary className="font-medium">¿Es seguro?</summary>
            <p className="mt-2 text-sm text-gray-500">Sí, protegemos tus datos y compras.</p>
        </details>
      </div>
    </div>
  );
}
