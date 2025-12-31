"use client";

import { Bell, Search, Menu } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminHeader({ user }: { user: any }) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState("users");
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
       const url = `/admin/${searchType}?q=${encodeURIComponent(searchValue)}`;
       router.push(url);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search Input with Type Selector */}
      <div className="flex-1 max-w-2xl flex items-center gap-2">
        <form onSubmit={handleSearch} className="relative w-full flex gap-2">
           <select 
             value={searchType}
             onChange={(e) => setSearchType(e.target.value)}
             className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#12753e] cursor-pointer"
           >
              <option value="users">Usuarios</option>
              <option value="companies">Empresas</option>
              <option value="products">Productos</option>
           </select>
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={`Buscar ${searchType === 'users' ? 'usuarios' : searchType === 'companies' ? 'empresas' : 'productos'}...`}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#12753e]/20 focus:border-[#12753e]"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
          </div>
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
             <button 
               className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" 
               onClick={() => setIsNotifOpen(!isNotifOpen)}
             >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                   <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 font-semibold text-xs text-gray-500">
                      Notificaciones de Admin
                   </div>
                   <div className="p-4 text-center text-sm text-gray-500">
                      No hay alertas críticas del sistema.
                   </div>
                </div>
              </>
            )}
        </div>
        
        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        {/* User Menu (Reused) */}
        <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                 <p className="text-sm font-medium text-gray-900">{user.name}</p>
                 <p className="text-xs text-gray-500">Administrador</p>
             </div>
             <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
