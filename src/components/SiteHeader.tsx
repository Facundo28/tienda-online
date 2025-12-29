import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/UserMenu";
import { ProductsCategorySelect } from "@/components/ProductsCategorySelect";
import { NotificationsMenu } from "@/components/NotificationsMenu";
import { prisma } from "@/lib/prisma";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const query = ""; 

  // Address Logic
  const city = user?.city;
  const state = user?.state;
  const locationLabel = city ? city : (state ? state : "Capital Federal");
  
  // Notifications Logic
  let notifications: any[] = [];
  if (user) {
        // 1. User Notifications (Orders)
        const orders = await prisma.order.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            select: { id: true, status: true, deliveryStatus: true, updatedAt: true, claim: { select: { status: true } } }
        });
        
        const orderNotifs = orders.map((o: any) => {
            let title = "Actualización de pedido";
            let desc = `Tu pedido está en proceso.`;
            let type: 'info' | 'success' | 'warning' | 'error' = 'info';

            if (o.deliveryStatus === 'DELIVERED') {
                title = "¡Paquete entregado!";
                desc = "Tu envío ha llegado a destino.";
                type = 'success';
            } else if (o.deliveryStatus === 'ON_WAY') {
                title = "Envío en camino";
                desc = "El conductor está cerca de tu domicilio.";
                type = 'info';
            } else if (o.status === 'DISPUTED' || o.claim) {
                title = "Reclamo abierto";
                desc = "Tienes un reclamo pendiente en este pedido.";
                type = 'warning';
            } else if (o.status === 'PAID') {
                title = "Pago acreditado";
                desc = "Preparamos tu paquete.";
                type = 'success';
            }

            return {
                id: o.id,
                title,
                description: desc,
                href: `/orders`,
                date: o.updatedAt,
                read: false,
                type
            };
        });
        
        notifications = [...orderNotifs];

        // 2. Admin Notifications (Claims)
        if (user.role === 'ADMIN') {
            const claims = await prisma.claim.findMany({
                where: { status: 'OPEN' },
                include: { user: true, order: true },
                orderBy: { createdAt: 'desc' },
                take: 5
            });

            const adminNotifs = claims.map((c: any) => ({
                id: c.id,
                title: "⚠️ Nuevo Reclamo",
                description: `Usuario ${c.user.name} inició un reclamo. Orden #${c.order.id.slice(-4)}. Motivo: ${c.type}`,
                href: `/admin/orders`, // Link to admin orders list or specific one
                date: c.createdAt,
                read: false,
                type: 'error'
            }));
            
            // Merge and sort by date
            notifications = [...adminNotifs, ...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
  }

  return (
    <header className="sticky top-0 z-50 w-full shadow-md print:hidden" style={{ backgroundColor: '#12753e' }}>
      <div className="mx-auto px-4 py-2.5 flex flex-col gap-3 text-white max-w-[1248px]">
        
        {/* ROW 1: Logo + Search + Right Banner Space */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 md:gap-12">
            {/* LOGO */}
            <Link href="/" className="flex items-center shrink-0 min-w-[140px]">
                <span className="font-bold text-2xl tracking-tight">Market Online</span>
            </Link>

            {/* SEARCH */}
            <div className="w-full">
                <form action="/products" method="get" className="relative w-full shadow-sm rounded-sm">
                    <input
                        type="search"
                        name="q"
                        placeholder="Buscar productos, marcas y más..."
                        className="h-[38px] w-full rounded-sm border-0 bg-white px-4 pr-10 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 shadow-sm"
                        defaultValue={query}
                    />
                    <button
                        type="submit"
                        className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-gray-400 hover:text-[#12753e]"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </button>
                    <div className="absolute right-10 top-2 bottom-2 w-px bg-gray-200"></div>
                </form>
            </div>

            {/* RIGHT AREA (Promo / Mobile Menu) */}
            <div className="flex items-center justify-end min-w-[300px] hidden md:flex">
               <span className="text-xs font-medium opacity-80 uppercase tracking-wide">
                  Envíos Gratis en 24hs
               </span>
            </div>

             {/* Mobile User Menu Trigger */}
             <div className="md:hidden flex items-center">
                 <UserMenu user={user ? { ...user, role: user.role ?? undefined } : { name: "Invitado", email: "", avatarUrl: null }} />
             </div>
        </div>

        {/* ROW 2: Navigation Links (Desktop only) */}
        <div className="hidden md:grid grid-cols-[auto_1fr_auto] items-end gap-6 md:gap-12 pb-1">
            
            {/* LEFT: Address / Location */}
            <div className="min-w-[140px] flex justify-start">
               <Link href={user ? "/account/address" : "/login"} className="flex items-center gap-1 hover:border-white/20 border border-transparent rounded px-1 -ml-1.5 transition-colors cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 opacity-90">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <div className="flex flex-col items-start leading-none gap-0.5">
                        <span className="text-[10px] opacity-70 font-light text-white/80">
                           {user ? "Enviar a" : "Enviar a"}
                        </span>
                        <span className="font-normal text-xs text-white">
                            {locationLabel}
                        </span>
                    </div>
                </Link>
            </div>

            {/* MIDDLE: Categories & Main Nav */}
            <div className="flex items-center gap-5 text-[13px] text-white/90">
                <div className="relative z-10">
                    <ProductsCategorySelect /> 
                </div>

                <Link href="/products?filter=offers" className="hover:text-white transition-colors opacity-80 hover:opacity-100 font-light">Ofertas</Link>
                <Link href="/vender" className="hover:text-white transition-colors opacity-80 hover:opacity-100 font-light">Vender</Link>
                <Link href="/help" className="hover:text-white transition-colors opacity-80 hover:opacity-100 font-light">Ayuda</Link>
            </div>

            {/* RIGHT: User Actions */}
            <div className="flex items-center justify-end gap-5 text-[13px] font-medium min-w-[300px]">
                 {!user ? (
                    <div className="flex items-center gap-4">
                        <Link href="/register" className="hover:text-white transition-colors">Creá tu cuenta</Link>
                        <Link href="/login" className="hover:text-white transition-colors">Ingresá</Link>
                         <Link href="/cart">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                             </svg>
                        </Link>
                    </div>
                 ) : (
                    <div className="flex items-center gap-4">
                        <UserMenu user={user} />

                        <Link href="/orders" className="hover:opacity-100 opacity-90 font-light" title="Mis Compras">
                            Mis compras
                        </Link>
                         <Link href="/favorites" className="hover:opacity-100 opacity-90 font-light hidden lg:block">
                            Favoritos
                        </Link>


                        
                        <NotificationsMenu notifications={notifications} />

                        <Link href="/cart" className="relative hover:opacity-100 opacity-90">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                             </svg>
                        </Link>
                    </div>
                 )}
            </div>
        </div>
      </div>
    </header>
  );
}
