"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, MapPin, ShoppingBag, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Mi Perfil",
    href: "/account/profile",
    icon: User,
  },
  {
    title: "Seguridad",
    href: "/account/security",
    icon: Shield,
  },
  {
    title: "Direcciones",
    href: "/account/address", // Mapping to existing address flow
    icon: MapPin,
  },
  {
    title: "Mis Compras",
    href: "/orders", // Redirects out of account layout usually, or we can keep it here
    icon: ShoppingBag,
  },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
              isActive
                ? "bg-[#12753e]/10 text-[#12753e]"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon size={18} />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
