"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingBag, 
  AlertTriangle, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils"; // Assuming utility exists, if not I'll create it or use standard className

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/orders", label: "Ventas", icon: ShoppingBag },
  { href: "/admin/claims", label: "Reclamos", icon: AlertTriangle },
  // { href: "/admin/settings", label: "Configuración", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-md shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-[#12753e] text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
            <div className="h-16 flex items-center px-6 border-b border-white/10">
                <span className="text-xl font-bold tracking-tight">Admin Panel</span>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname ===(item.href) || pathname?.startsWith(item.href + "/");
                    const Icon = item.icon;
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive 
                                    ? "bg-white/10 text-white" 
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <Icon size={20} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
            
            <div className="p-4 border-t border-white/10">
                <div className="text-xs text-white/50">
                    &copy; 2025 Market EC
                </div>
            </div>
        </div>
      </aside>

      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
