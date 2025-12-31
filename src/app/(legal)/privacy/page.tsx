export default function PrivacyPage() {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 prose text-gray-700">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
        <p className="text-gray-500 text-sm mb-8">Última actualización: 28 de Diciembre, 2025</p>
  
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Resumen General</h2>
                <p>
                    En <strong>Market E.C</strong>, valoramos su privacidad y nos comprometemos a proteger sus datos personales. Esta Política de Privacidad explica cómo recopilamos, usamos y compartimos su información cuando utiliza nuestros servicios.
                </p>
            </section>
  
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Información que Recopilamos</h2>
                <p>Podemos recopilar los siguientes tipos de información:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Información de Identidad:</strong> Nombre, DNI, Fotografías de documentos (para validación KYC).</li>
                    <li><strong>Información de Contacto:</strong> Dirección de correo electrónico, número de teléfono, dirección de envío y facturación.</li>
                    <li><strong>Datos Financieros:</strong> Detalles necesarios para procesar pagos (procesados de forma segura por nuestros proveedores de pagos).</li>
                    <li><strong>Datos Técnicos:</strong> Dirección IP, tipo de navegador, sistema operativo y datos de navegación.</li>
                </ul>
            </section>
  
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Uso de la Información</h2>
                <p>Utilizamos sus datos personales para:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Procesar y entregar sus pedidos.</li>
                    <li>Validar su identidad y prevenir fraudes (KYC).</li>
                    <li>Gestionar su cuenta de usuario.</li>
                    <li>Mejorar nuestros servicios y la seguridad de la plataforma.</li>
                    <li>Enviarle notificaciones importantes sobre el estado de sus compras.</li>
                </ul>
            </section>
  
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compartir Información</h2>
                <p>
                    No vendemos su información personal. Solo compartimos datos con terceros en las siguientes circunstancias:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Proveedores de Servicios:</strong> Empresas de logística para realizar entregas, y procesadores de pago.</li>
                    <li><strong>Cumplimiento Legal:</strong> Cuando sea requerido por ley, una orden judicial u otra autoridad gubernamental.</li>
                </ul>
            </section>
  
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Seguridad de los Datos</h2>
                <p>
                    Implementamos medidas de seguridad técnicas y organizativas adecuadas para proteger sus datos personales contra el acceso no autorizado, la alteración, la divulgación o la destrucción. 
                    Nuestros procesos de validación de identidad (KYC) están diseñados con altos estándares de encriptación.
                </p>
            </section>
  
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Sus Derechos</h2>
                <p>
                    Usted tiene derecho a acceder, rectificar o eliminar su información personal. Puede gestionar la mayoría de sus datos directamente desde la sección "Mi Cuenta". 
                    Para solicitudes específicas, contáctenos a través de nuestros canales de soporte.
                </p>
            </section>
        </div>
      </div>
    );
  }
