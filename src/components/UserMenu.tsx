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
    role?: "ADMIN" | "USER";
    isVerified?: boolean;
  };
}

// ... helpers ...

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const avatarSrc = user.avatarUrl ? (user.avatarUrl.startsWith("http") || user.avatarUrl.startsWith("/") ? user.avatarUrl : `/${user.avatarUrl}`) : null;
  
  return (
    <details className="relative group">
      <summary className="list-none flex items-center gap-2 cursor-pointer text-white/90 hover:text-white transition-colors">
         <div className="flex items-center gap-2">
             <div className="w-5 h-5 relative rounded-full overflow-hidden bg-black/20 text-white flex items-center justify-center">
                 {avatarSrc ? (
                     <Image src={avatarSrc} alt={user.name || "Avatar"} fill className="object-cover" />
                 ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 opacity-90">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                      </svg>
                 )}
             </div>
             <span className="text-[13px] font-normal truncate max-w-[100px]">
                 {user.name ? user.name.split(" ")[0] : "Usuario"}
             </span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 opacity-70 group-hover:opacity-100">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
         </div>
      </summary>

      {/* Dropdown Content */}
      <div className="absolute right-0 z-50 mt-2 w-60 rounded-md border bg-white py-1 shadow-lg text-gray-800">
         <div className="absolute -top-2 right-6 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white"></div>
         
         <div className="flex flex-col text-right hidden sm:block">
            <span className="text-sm font-medium leading-none flex items-center gap-1 justify-end">
                {user.name}
                {user.isVerified && <VerifiedBadge />}
            </span>
            <span className="text-xs font-light opacity-80">{user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}</span>
        </div>

         <div className="py-1">
             <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#12753e]">Mis datos</Link>
             
             {/* Admin / Seller Links */}
             {(user.role === 'ADMIN' || true) && ( // Showing for all as "Vender" is open
                <>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link href="/vender" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#12753e]">Vender</Link>
                  <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#12753e]">Mis ventas</Link>
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
                  // refresh logic
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
