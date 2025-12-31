export default function TermsPage() {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 prose text-gray-700">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Términos y Condiciones de Uso</h1>
        <p className="text-gray-500 text-sm mb-8">Última actualización: 28 de Diciembre, 2025</p>
  
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducción</h2>
                <p>
                    Bienvenido a <strong>Market E.C</strong>. Estos términos y condiciones describen las reglas y regulaciones para el uso del sitio web Market E.C.
                    Al acceder a este sitio web, asumimos que aceptas estos términos y condiciones en su totalidad. No continúes usando el sitio web Market E.C si no aceptas todos los términos y condiciones establecidos en esta página.
                </p>
            </section>
  
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Cuentas de Usuario y Seguridad</h2>
                <p>
                    Para acceder a ciertas funciones de la plataforma, deberás registrarte y crear una cuenta. Al hacerlo, te comprometes a:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Proporcionar información veraz, exacta, actual y completa sobre tu identidad (Procedimiento KYC).</li>
                    <li>Mantener la confidencialidad de tu contraseña y cuenta.</li>
                    <li>Notificar inmediatamente cualquier uso no autorizado de tu cuenta o cualquier otra violación de seguridad.</li>
                </ul>
                <p className="mt-2">
                    Market E.C se reserva el derecho de eliminar cuentas que contengan información falsa o que infrinjan nuestras políticas de uso.
                </p>
            </section>
  
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Logística y Envíos</h2>
                <p>
                    Market E.C actúa como intermediario tecnológico para conectar vendedores, compradores y proveedores de servicios logísticos ("Partners").
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Los tiempos de entrega son estimados y pueden variar por factores externos.</li>
                    <li>Los Partners Logísticos son contratistas independientes verificados, responsables de la integridad de la carga durante el transporte.</li>
                    <li>Es responsabilidad del usuario asegurar que la dirección de entrega sea correcta y accesible.</li>
                </ul>
            </section>
  
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Propiedad Intelectual</h2>
                <p>
                    A menos que se indique lo contrario, Market E.C y/o sus licenciantes son propietarios de los derechos de propiedad intelectual de todo el material en Market E.C. 
                    Todos los derechos de propiedad intelectual están reservados. Puedes ver y/o imprimir páginas desde el sitio para tu uso personal sujeto a las restricciones establecidas en estos términos y condiciones.
                </p>
            </section>
  
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitación de Responsabilidad</h2>
                <p>
                    En ningún caso Market E.C, ni sus directores, empleados, socios, agentes, proveedores o afiliados, serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, 
                    incluyendo sin limitación, pérdida de beneficios, datos, uso, fondo de comercio, u otras pérdidas intangibles, resultantes de tu acceso o uso o la imposibilidad de acceder o usar el servicio.
                </p>
            </section>
  
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Modificaciones</h2>
                <p>
                    Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es importante, intentaremos proporcionar un aviso con al menos 30 días de antelación antes de que entren en vigor los nuevos términos.
                </p>
            </section>
  
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contacto Legal</h2>
                <p>
                    Si tienes alguna pregunta sobre estos Términos, por favor contáctanos en <a href="mailto:legal@market-ec.com" className="text-[#12753e] hover:underline">legal@market-ec.com</a>.
                </p>
            </section>
        </div>
      </div>
    );
  }
