"use client";

import { Bell, Search, Menu } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminHeader({ user }: { user: any }) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // For now, global search redirects to orders if it looks like an ID, or users otherwise
      // Ideally a dedicated search page. Let's send to users by default 
      // or implement a smart redirect.
      // For "Real Functionality", let's search users for now as it's a common admin task.
      router.push(`/admin/users?q=${encodeURIComponent(searchValue)}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search Input */}
      <div className="flex-1 max-w-xl">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar usuarios (nombre, email)..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#12753e]/20 focus:border-[#12753e]"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications (Mocked for Admin specific alerts) */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
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
