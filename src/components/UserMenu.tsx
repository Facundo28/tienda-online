"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ... helper types and functions ...
import { VerifiedBadge } from "@/components/VerifiedBadge";

interface UserMenuProps {
  user: {
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
    role?: string; // Relaxed type to allow all roles
    isVerified?: boolean;
    companyOwned?: { name: string; isVerified: boolean } | null;
    workerOf?: { name: string; isVerified: boolean } | null;
  };
}

// ... helpers ...

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const avatarSrc = user.avatarUrl ? (user.avatarUrl.startsWith("http") || user.avatarUrl.startsWith("/") ? user.avatarUrl : `/${user.avatarUrl}`) : null;
  
  // Determine Badge Label
  let roleBadge = null;
  if (user.role === 'LOGISTICS_ADMIN' && user.companyOwned) {
      roleBadge = (
          <div className="flex flex-col items-center">
             <span className="text-[10px] font-bold text-[#12753e] uppercase tracking-wide flex items-center gap-1">
                 {user.companyOwned.name}
                 {user.companyOwned.isVerified && <VerifiedBadge />}
             </span>
             <span className="text-[9px] text-gray-400">Dueño</span>
          </div>
      );
  } else if (user.role === 'DRIVER' && user.workerOf) {
       roleBadge = (
          <div className="flex flex-col items-center">
             <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                 {user.workerOf.name}
             </span>
             <span className="text-[9px] text-[#12753e] font-medium flex items-center gap-1">
                 Repartidor
             </span>
          </div>
      );
  } else if (user.role === 'ADMIN') {
      roleBadge = <span className="text-xs font-light text-red-600 font-medium">Administrador</span>;
  } else {
      if (user.isVerified) {
          roleBadge = (
            <span className="text-[10px] font-bold text-[#12753e] uppercase tracking-wide flex items-center gap-1">
                Usuario Verificado
                <VerifiedBadge />
            </span>
          );
      } else {
          roleBadge = <span className="text-xs font-light opacity-80">Usuario</span>;
      }
  }

  return (
    <details className="relative group">
      <summary className="list-none flex items-center gap-2 cursor-pointer text-white/90 hover:text-white transition-colors">
         <div className="flex items-center gap-2">
             <div className="w-8 h-8 relative rounded-full overflow-hidden bg-black/20 text-white flex items-center justify-center border border-white/20">
                 {avatarSrc ? (
                     <Image src={avatarSrc} alt={user.name || "Avatar"} fill className="object-cover" />
                 ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-90">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                      </svg>
                 )}
             </div>
             <span className="text-[13px] font-normal truncate max-w-[100px]">
                 {user.role === 'LOGISTICS_ADMIN' && user.companyOwned ? user.companyOwned.name : (user.name ? user.name.split(" ")[0] : "Usuario")}
             </span>
              {/* Green Check for Owner in Navbar */}
              {user.role === 'LOGISTICS_ADMIN' && user.companyOwned?.isVerified && (
                  <VerifiedBadge />
              )}
              
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 opacity-70 group-hover:opacity-100">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
         </div>
      </summary>

      {/* Dropdown Content */}
      <div className="absolute right-0 z-50 mt-2 w-60 rounded-md border bg-white py-1 shadow-lg text-gray-800">
         <div className="absolute -top-2 right-6 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white"></div>
         
         <div className="flex flex-col text-center hidden sm:block px-4 py-2 border-b border-gray-50">
            <span className="text-sm font-medium leading-none flex items-center gap-1 justify-center mb-1">
                {user.name}
            </span>
            {roleBadge}
        </div>

         <div className="py-1" onClick={(e) => {
             // Close details on link click
             const details = e.currentTarget.closest('details');
             if (details) details.removeAttribute('open');
         }}>
             <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#12753e]">Mis datos</Link>

             
             {/* Admin / Seller Links */}
                  <div className="border-t border-gray-100 my-1"></div>
                  {/* Removed duplicate "Vender" link as requested, "Mis ventas" now points to dashboard */}
                  <Link href="/vender" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#12753e]">Mis ventas</Link>
                  <Link href="/account/premium" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#12753e] flex items-center justify-between group-hover:text-yellow-600">
                      <span>Mi Página Premium</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                  </Link>

             
             {/* Logistics Owner Link */}
             {user.role === 'LOGISTICS_ADMIN' && (
                 <>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link href="/logistics" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#12753e] flex items-center justify-between">
                        <span>Mi Logística</span>
                        <VerifiedBadge />
                    </Link>
                 </>
             )}

             {/* Driver Link */}
             {user.role === 'DRIVER' && (
                 <>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link href="/delivery" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#12753e]">Modo Repartidor</Link>
                 </>
             )}

             {/* Admin Only */}
             {user.role === 'ADMIN' && (
                 <>
                   <div className="border-t border-gray-100 my-1"></div>
                   <Link href="/admin/users" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#12753e]">Administrar Usuarios</Link>
                   <Link href="/scan" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#12753e]">Escanear envíos</Link>
                 </>
             )}

            <div className="border-t border-gray-100 my-1"></div>
            <button
                type="button"
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  location.href = "/";
                }}
              >
                Salir
            </button>
         </div>
      </div>
    </details>
  );
}
