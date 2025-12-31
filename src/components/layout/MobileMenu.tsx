"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Home, ShoppingBag, HelpCircle, User, LogOut, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  user: any;
}

export function MobileMenu({ user }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-white/90 hover:text-white transition-colors p-1"
        aria-label="Menú"
      >
        <Menu className="w-7 h-7" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9990] backdrop-blur-sm transition-opacity animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[9999] shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-[#126e30] p-4 pt-8 text-white">
            <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
            >
                <X className="w-6 h-6" />
            </button>

            {user ? (
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden relative text-xl font-bold shrink-0">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{user.name?.[0]?.toUpperCase() || "U"}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-lg leading-tight truncate">{user.name?.split(" ")[0]}</p>
                    <p className="text-xs text-white/70">Nivel 3 - Market Puntos</p>
                  </div>
               </div>
            ) : (
                <div className="mb-2">
                    <p className="font-bold text-xl mb-1">Bienvenido</p>
                    <p className="text-sm text-white/80">Ingresa para ver tus compras</p>
                </div>
            )}
        </div>

        {/* Menu Items */}
        <div className="flex flex-col py-2 h-full overflow-y-auto">
            
            <div className="px-4 py-2">
                <Link href="/" className="flex items-center gap-4 py-3 text-gray-700 hover:text-[#126e30] border-b border-gray-50">
                    <Home className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">Inicio</span>
                </Link>
                <Link href="/products?filter=offers" className="flex items-center gap-4 py-3 text-gray-700 hover:text-[#126e30] border-b border-gray-50">
                    <ShoppingBag className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">Ofertas</span>
                </Link>
                 <Link href="/vender" className="flex items-center gap-4 py-3 text-gray-700 hover:text-[#126e30] border-b border-gray-50">
                    <div className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold">$</div>
                    <span className="font-medium">Vender</span>
                </Link>
                <Link href="/help" className="flex items-center gap-4 py-3 text-gray-700 hover:text-[#126e30] border-b border-gray-50">
                    <HelpCircle className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">Ayuda</span>
                </Link>
                 <Link href="/account/premium" className="flex items-center gap-4 py-3 text-yellow-700 hover:text-yellow-800 border-b border-gray-50 bg-yellow-50/50">
                    <div className="w-5 h-5 flex items-center justify-center text-yellow-600 font-bold">★</div>
                    <span className="font-medium">Mi Página Premium</span>
                </Link>
            </div>

            {!user && (
                <div className="mt-4 px-4 flex flex-col gap-2">
                    <Link href="/login" className="w-full bg-[#126e30] text-white py-2.5 rounded-lg text-center font-medium">Ingresá</Link>
                    <Link href="/register" className="w-full bg-white border border-[#126e30] text-[#126e30] py-2.5 rounded-lg text-center font-medium">Creá tu cuenta</Link>
                </div>
            )}

             {user && (
                <div className="mt-auto mb-32 border-t border-gray-100 pt-2 pb-8">
                    <Link href="/account" className="flex items-center gap-4 px-6 py-3 text-gray-600 hover:bg-gray-50">
                        <User className="w-5 h-5" />
                        Mi Perfil
                    </Link>
                    <button 
                        onClick={async () => {
                          await fetch("/api/auth/logout", { method: "POST" });
                          window.location.href = "/";
                        }}
                        className="w-full flex items-center gap-4 px-6 py-3 text-red-600 hover:bg-red-50 text-left"
                    >
                        <LogOut className="w-5 h-5" />
                        Salir
                    </button>
                </div>
            )}
        </div>
      </div>
    </>
  );
}
