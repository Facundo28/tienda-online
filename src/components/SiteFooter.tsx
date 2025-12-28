import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Truck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-[#12753e] text-white pt-10 pb-6 mt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Partner */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Market Online</h2>
            <p className="text-green-100 text-sm">
              La plataforma de comercio y logística más segura de tu ciudad.
            </p>
            <Link 
                href="/partner-request"
                className="inline-flex items-center gap-2 bg-black/20 hover:bg-black/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-green-600/30"
            >
                <Truck className="w-4 h-4" />
                Quiero ser Partner Logístico
            </Link>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="font-semibold mb-4 text-green-50">Comprar</h3>
            <ul className="space-y-2 text-sm text-green-100/80">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Productos</Link></li>
              <li><Link href="/account" className="hover:text-white transition-colors">Mi Cuenta</Link></li>
              <li><Link href="/checkout" className="hover:text-white transition-colors">Carrito</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="font-semibold mb-4 text-green-50">Ayuda</h3>
            <ul className="space-y-2 text-sm text-green-100/80">
              <li><Link href="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h3 className="font-semibold mb-4 text-green-50">Síguenos</h3>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-green-700/50 rounded-full hover:bg-green-600 transition-colors text-white">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-green-700/50 rounded-full hover:bg-green-600 transition-colors text-white">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-green-700/50 rounded-full hover:bg-green-600 transition-colors text-white">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="mailto:contacto@marketec.com" className="p-2 bg-green-700/50 rounded-full hover:bg-green-600 transition-colors text-white">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-green-700 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-green-200/60">
          <p>© 2025 Market Online. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <span>Privacidad</span>
            <span>Accesibilidad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
