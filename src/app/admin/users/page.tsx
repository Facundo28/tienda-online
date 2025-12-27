import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { deleteUser, setUserActive, setUserRole } from "./actions";

export const dynamic = "force-dynamic";

type UserRow = Awaited<ReturnType<(typeof prisma.user.findMany)>>[number];

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = (await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })) as UserRow[];

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin: Usuarios
          </h1>
          <p className="text-sm text-foreground/70">
            Moderación de cuentas (activar/desactivar y rol).
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
          href="/admin/products"
        >
          Admin productos
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border bg-background p-6">
        {users.length === 0 ? (
          <p className="text-sm text-foreground/70">No hay usuarios.</p>
        ) : (
          <ul className="space-y-3">
            {users.map((u) => (
              <li
                key={u.id}
                className="rounded-2xl border p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate">{u.name}</div>
                  <div className="text-sm text-foreground/70 truncate">
                    {u.email}
                  </div>
                  <div className="mt-1 text-sm text-foreground/70">
                    Rol: <span className="font-medium">{u.role}</span> · Estado:{" "}
                    <span className="font-medium">
                      {u.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await setUserActive(u.id, !u.isActive);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
                    >
                      {u.isActive ? "Desactivar" : "Activar"}
                    </button>
                  </form>

                  <form
                    action={async () => {
                      "use server";
                      await setUserRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN");
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
                    >
                      {u.role === "ADMIN" ? "Hacer USER" : "Hacer ADMIN"}
                    </button>
                  </form>

                  <form
                    action={async () => {
                      "use server";
                      await deleteUser(u.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
