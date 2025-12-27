"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserMenuUser = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

function normalizeImageSrc(src: string) {
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return src;
  return `/${src}`;
}

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase());
  return letters.join("") || "U";
}

export function UserMenu({ user }: { user: UserMenuUser }) {
  const router = useRouter();
  const avatarSrc = user.avatarUrl ? normalizeImageSrc(user.avatarUrl) : null;

  return (
    <details className="relative">
      <summary className="list-none">
        <span className="inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-foreground/5">
          <span className="relative h-7 w-7 overflow-hidden rounded-full border bg-foreground/5">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={user.name}
                fill
                className="object-cover"
                sizes="28px"
                unoptimized={avatarSrc.startsWith("/uploads/")}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-foreground/70">
                {initials(user.name)}
              </span>
            )}
          </span>
          <span className="hidden sm:inline">{user.name}</span>
        </span>
      </summary>

      <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border bg-background shadow-sm">
        <div className="border-b px-4 py-3">
          <div className="text-sm font-semibold truncate">{user.name}</div>
          <div className="text-xs text-foreground/70 truncate">{user.email}</div>
        </div>

        <div className="p-2 grid gap-1">
          <Link
            href="/account"
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-foreground/5"
          >
            Mi perfil
          </Link>

          <button
            type="button"
            className="text-left rounded-md px-3 py-2 text-sm font-medium hover:bg-foreground/5"
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
        </div>
      </div>
    </details>
  );
}
