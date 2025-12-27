import Image from "next/image";

import { requireUser } from "@/lib/auth/session";
import { updateProfile } from "./actions";

export const dynamic = "force-dynamic";

function normalizeImageSrc(src: string) {
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return src;
  return `/${src}`;
}

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <section className="mx-auto max-w-2xl">
      <div className="rounded-2xl border bg-background p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Mi perfil</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Edita tus datos personales y tu foto.
        </p>

        <form
          className="mt-6 grid gap-4"
          action={updateProfile}
        >
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border bg-foreground/5">
              {user.avatarUrl ? (
                <Image
                  src={normalizeImageSrc(user.avatarUrl)}
                  alt={user.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized={normalizeImageSrc(user.avatarUrl).startsWith(
                    "/uploads/",
                  )}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-foreground/70">
                  {user.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase())
                    .join("")}
                </div>
              )}
            </div>

            <div className="grid gap-1">
              <div className="text-sm font-medium">Foto de usuario</div>
              <input
                className="rounded-md border bg-background px-3 py-2 text-sm"
                type="file"
                name="avatar"
                accept="image/png,image/jpeg,image/webp"
              />
              <div className="text-xs text-foreground/60">JPG/PNG/WebP · máx 5MB</div>
            </div>
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="name">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              defaultValue={user.name}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="mt-2">
            <div className="text-sm font-semibold">Datos para checkout</div>
            <div className="text-xs text-foreground/60">
              Se usarán para autocompletar cuando compres.
            </div>
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="customerPhone">
              Teléfono
            </label>
            <input
              id="customerPhone"
              name="customerPhone"
              defaultValue={user.phone ?? ""}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Teléfono (opcional)"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="addressLine1">
              Dirección
            </label>
            <input
              id="addressLine1"
              name="addressLine1"
              defaultValue={user.addressLine1 ?? ""}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Dirección"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="addressLine2">
              Depto / piso
            </label>
            <input
              id="addressLine2"
              name="addressLine2"
              defaultValue={user.addressLine2 ?? ""}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Depto / piso (opcional)"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="grid gap-1">
              <label className="text-sm font-medium" htmlFor="city">
                Ciudad
              </label>
              <input
                id="city"
                name="city"
                defaultValue={user.city ?? ""}
                className="rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Ciudad"
              />
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium" htmlFor="state">
                Estado/Provincia
              </label>
              <input
                id="state"
                name="state"
                defaultValue={user.state ?? ""}
                className="rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Estado/Provincia"
              />
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium" htmlFor="postalCode">
                Código postal
              </label>
              <input
                id="postalCode"
                name="postalCode"
                defaultValue={user.postalCode ?? ""}
                className="rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Código postal"
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Guardar cambios
          </button>
        </form>
      </div>
    </section>
  );
}
