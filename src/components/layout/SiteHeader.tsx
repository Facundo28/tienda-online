import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/UserMenu";
import { NotificationsMenu } from "@/components/NotificationsMenu";
import { CartWidget } from "@/components/cart/CartWidget";
import { prisma } from "@/lib/prisma";
import { Menu, Search, MapPin, Recycle, Tag, Store, LifeBuoy, Heart } from "lucide-react";
import { Marquee } from "@/components/Marquee";
import { ProductsCategorySelect } from "@/components/ProductsCategorySelect";
import { MobileMenu } from "@/components/layout/MobileMenu";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const query = ""; 

  // Address Logic (Can be used in chips or sub-menu later if needed)
  const city = user?.city;
  const state = user?.state;
  const locationLabel = city ? city : (state ? state : "Concordia");
  
  // Notifications Logic
  let notifications: any[] = [];
  if (user) {
        notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
  }

  return (
    <header className="sticky top-0 z-50 w-full shadow-lg print:hidden flex flex-col font-sans">
      
      {/* 0. MARQUEE */}
      <div className="relative z-30">
          <Marquee />
      </div>

      {/* 1. GREEN BLOCK (Main Header) */}
      <div className="bg-[#126e30] pt-2 pb-5 lg:pb-3 px-4 rounded-b-[24px] lg:rounded-none shadow-sm relative z-40">
          
          <div className="max-w-[1200px] mx-auto flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
              
              {/* LEFT: Logo + Mobile Menu */}
              <div className="flex items-center gap-3 shrink-0 order-1">
                  
                  {/* Mobile Menu Trigger (Use client component) */}
                  <div className="lg:hidden">
                    <MobileMenu user={user} />
                  </div>

                  {/* Desktop Menu Trigger - Removed as per feedback */}

                  <Link href="/" className="flex items-center gap-2 group">
                      <div className="relative w-14 h-14 md:w-16 md:h-16">
                          <img 
                            src="/market-ec.png" 
                            alt="Logo" 
                            className="object-contain brightness-0 invert w-full h-full"
                          />
                      </div>
                      <span className="text-white font-bold text-lg md:text-xl tracking-tight hidden xs:block">Market EC</span>
                  </Link>

                  {/* LOCATION / SHIPPING (Desktop) - Custom Chip Design */}
                  <div className="hidden lg:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 cursor-pointer group/loc ml-2">
                       <MapPin className="w-3.5 h-3.5 text-green-200 group-hover/loc:text-white transition-colors" />
                       <span className="text-xs font-medium text-white/90 group-hover/loc:text-white">
                          Enviar a {locationLabel}
                       </span>
                  </div>
              </div>

              {/* CENTER: SEARCH BAR (Desktop Only - In Row 1) */}
              <div className="hidden lg:block flex-1 max-w-[600px] mx-4 order-2">
                    <form action="/products" method="get" className="relative w-full group">
                        <input
                            type="search"
                            name="q"
                            placeholder="¿Qué estás buscando hoy?"
                            className="w-full h-[40px] pl-4 pr-12 rounded-full border-0 bg-white text-gray-900 placeholder:text-gray-400 text-sm shadow-sm focus:outline-none"
                            defaultValue={query}
                            autoComplete="off"
                        />
                         <button
                            type="submit"
                            className="absolute right-1 top-1 bottom-1 aspect-square bg-[#126e30] hover:bg-[#10602a] text-white rounded-full flex items-center justify-center transition-colors"
                        >
                             <Search className="w-4 h-4" />
                        </button>
                    </form>
              </div>

              {/* RIGHT: User Actions */}
              <div className="flex items-center gap-4 md:gap-6 shrink-0 order-2 lg:order-3">
                  {user ? (
                      <>
                        <div className="text-white/90 hover:text-white transition-opacity relative">
                            <NotificationsMenu notifications={notifications} />
                             <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full border border-[#126e30]"></span>
                        </div>

                        <Link href="/favorites" className="text-white/90 hover:text-white transition-opacity relative" title="Mis Favoritos">
                            <Heart className="w-6 h-6" />
                        </Link>
                        
                        <div className="text-white/90 hover:text-white transition-opacity">
                            <CartWidget />
                        </div>

                        
                        <div className="pl-2 border-l border-white/10 hidden lg:flex items-center gap-3">
                             <div className="">
                                   {/* UserMenu handles Avatar + Text internally now for full clickability */}
                                   <UserMenu user={user} />
                             </div>
                        </div>

                         {/* Mobile User visible only via UserMenu logic usually, but here we enforce strict layout */}
                         <div className="lg:hidden">
                            <UserMenu user={user} />
                         </div>
                      </>
                  ) : (
                      <div className="flex items-center gap-3 text-sm font-medium text-white/90">
                          <Link href="/login" className="hover:text-white">Ingresá</Link>
                          <Link href="/register" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm">Crea tu cuenta</Link>
                      </div>
                  )}
              </div>

              {/* MOBILE SEARCH BAR (Row 2 - Full width on mobile, hidden on desktop) */}
              <div className="w-full lg:hidden order-3 mt-2">
                    <form action="/products" method="get" className="relative w-full group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#126e30] transition-colors" />
                        </div>
                        <input
                            type="search"
                            name="q"
                            placeholder="¿Qué estás buscando hoy?"
                            className="w-full h-[52px] pl-12 pr-14 rounded-full border-0 bg-white text-gray-900 placeholder:text-gray-400 text-base shadow-lg shadow-[#0b4d20]/20 focus:ring-2 focus:ring-white/20 outline-none transition-shadow"
                            defaultValue={query}
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-[#126e30]/10 hover:bg-[#126e30]/20 text-[#126e30] rounded-full flex items-center justify-center transition-colors"
                        >
                             <Search className="w-5 h-5" />
                        </button>
                    </form>
              </div>
          </div>
      </div>

      {/* 2. CHIPS STRIP (White) */}
      <div className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100 z-10 relative">
           <div className="max-w-[1200px] mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
                
                {/* CHIPS */}
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto lg:overflow-visible no-scrollbar pr-4 lg:pr-0">
                    <div className="relative z-20 shrink-0">
                        <ProductsCategorySelect /> 
                    </div>
                    <Link href="/products?filter=offers" className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#126e30] hover:shadow-md hover:text-[#126e30] px-4 py-1.5 rounded-full text-sm font-medium text-gray-700 whitespace-nowrap transition-all active:scale-95">
                        <Tag className="w-4 h-4 text-yellow-600" />
                        Ofertas
                    </Link>
                    
                    <Link href="/vender" className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#126e30] hover:shadow-md hover:text-[#126e30] px-4 py-1.5 rounded-full text-sm font-medium text-gray-700 whitespace-nowrap transition-all active:scale-95">
                        <Store className="w-4 h-4 text-orange-500" />
                        Vender
                    </Link>

                    <Link href="/help" className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#126e30] hover:shadow-md hover:text-[#126e30] px-4 py-1.5 rounded-full text-sm font-medium text-gray-700 whitespace-nowrap transition-all active:scale-95">
                        <LifeBuoy className="w-4 h-4 text-blue-500" />
                        Ayuda
                    </Link>
                </div>

                {/* VALUE MESSAGE (Desktop + Mobile) */}
                <div className="hidden lg:block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Recibí tus compras rápido y seguro.
                </div>
                {/* Mobile Promo Text */}
                <div className="lg:hidden text-center mt-2 w-full">
                    <p className="text-[10px] font-medium text-[#126e30]/70 uppercase tracking-widest">
                        Recibí tus compras rápido y seguro
                    </p>
               </div>
           </div>
      </div>

    </header>
  );
}
