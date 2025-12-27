"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-foreground/5"
      onClick={async () => {
        await fetch("/api/auth/logout", {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
        });
        router.replace("/");
        router.refresh();
      }}
    >
      Salir
    </button>
  );
}
