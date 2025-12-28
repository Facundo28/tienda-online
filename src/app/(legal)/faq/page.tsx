export default function FAQPage() {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Preguntas Frecuentes</h1>
        
        <div className="space-y-6">
            <details className="group bg-white rounded-xl border border-gray-200 p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer">
                    <h2 className="text-lg font-medium text-gray-900">
                        ¿Cómo verifico mi identidad?
                    </h2>
                    <span className="shrink-0 ml-1.5 p-1.5 text-gray-900 bg-gray-50 rounded-full group-open:-rotate-180 transition duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </span>
                </summary>
                <p className="mt-4 leading-relaxed text-gray-700">
                    Ve a "Mi Cuenta" &gt; "Seguridad" y sigue los pasos para subir foto de tu DNI (Frente y Dorso) y una Selfie. Es un requisito obligatorio para comprar y vender.
                </p>
            </details>
  
            <details className="group bg-white rounded-xl border border-gray-200 p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer">
                    <h2 className="text-lg font-medium text-gray-900">
                        ¿Cómo puedo ser repartidor?
                    </h2>
                    <span className="shrink-0 ml-1.5 p-1.5 text-gray-900 bg-gray-50 rounded-full group-open:-rotate-180 transition duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </span>
                </summary>
                <p className="mt-4 leading-relaxed text-gray-700">
                    Debes solicitar el alta como "Partner Logístico" usando el enlace en el pie de página. Necesitas vehículo propio, VTV al día y certificado de antecedentes penales.
                </p>
            </details>
        </div>
      </div>
    );
  }
