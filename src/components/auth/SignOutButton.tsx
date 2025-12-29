"use client";

import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
    className?: string; 
    children?: React.ReactNode;
}

export function SignOutButton({ className, children }: SignOutButtonProps) {
  return (
    <button
        type="button"
        className={cn("flex items-center gap-2", className)}
        onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            location.href = "/";
        }}
    >
        {children || (
            <>
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
            </>
        )}
    </button>
  );
}
