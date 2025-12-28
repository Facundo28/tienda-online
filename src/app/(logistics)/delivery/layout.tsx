import { Toaster } from "sonner";
import Link from "next/link";
import { UserMenu } from "@/components/UserMenu"; // Reusing UserMenu or custom? Custom is better for isolation but reusing is faster.
import { requireUser } from "@/lib/auth/session";
import { ShoppingBag } from "lucide-react";

export default async function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

   return (
    <div className="min-h-screen bg-gray-100 pb-24 font-sans text-gray-900">
       {/* Header Moderno con Gradiente */}
       <header className="bg-gradient-to-r from-green-900 to-green-800 text-white pt-6 pb-20 px-6 rounded-b-[2.5rem] shadow-xl relative z-0">
           <div className="flex justify-between items-center mb-4">
               <div>
                   <span className="text-green-400 text-xs font-bold tracking-wider uppercase">MODO CONDUCTOR</span>
                   <h1 className="text-2xl font-bold flex items-center gap-2">
                       Hola, {user.name.split(' ')[0]}
                   </h1>
               </div>
               <div className="flex items-center gap-3">
                    <Link href="/" className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white px-3 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all">
                        <ShoppingBag className="w-4 h-4" />
                        Tienda
                    </Link>
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold shadow-inner text-white">
                            {user.name.substring(0,2).toUpperCase()}
                    </div>
               </div>
           </div>
           
           {/* Mini Stats en Header */}
           <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 min-w-[100px]">
                    <p className="text-white/60 text-xs">Ganancias Hoy</p>
                    <p className="font-bold text-lg">$0</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 min-w-[100px]">
                    <p className="text-white/60 text-xs">Completados</p>
                    <p className="font-bold text-lg">0</p>
                </div>
           </div>
       </header>

       <main className="max-w-md mx-auto w-full -mt-12 px-4 relative z-10 pb-24">
           {children}
       </main>
       
       {/* Bottom Navigation Bar */}
       <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-6 pb-safe flex justify-around items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <Link href="/delivery" className="flex flex-col items-center gap-1 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.632 9.249c.567.609.165 1.625-.668 1.685l-2.003.13V21.5c0 .414-.336.75-.75.75H14.5a.75.75 0 0 1-.75-.75v-3.5a1.75 1.75 0 0 0-3.5 0v3.5c0 .414-.336.75-.75.75H5.75a.75.75 0 0 1-.75-.75v-6.596l-2.003-.13c-.833-.06-1.235-1.076-.668-1.685L11.47 3.841Z" />
                </svg>
                <span className="text-[10px] font-bold">Inicio</span>
            </Link>
            
            <Link href="/scan" className="relative -top-6 bg-[#12753e] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-green-600/30 hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                </svg>
            </Link>

            <Link href="/delivery/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] font-medium">Perfil</span>
            </Link>
       </nav>
       
       <Toaster richColors position="top-center" />
    </div>
  );
}
