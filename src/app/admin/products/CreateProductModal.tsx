"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { createProduct } from "./actions";

const categories = [
  { value: "INDUMENTARIA", label: "Indumentaria" },
  { value: "VEHICULOS", label: "Vehículos" },
  { value: "INMUEBLES", label: "Inmuebles" },
  { value: "TECNOLOGIA", label: "Tecnología" },
  { value: "HOGAR", label: "Hogar" },
  { value: "SERVICIOS", label: "Servicios" },
  { value: "OTROS", label: "Otros" },
] as const;

function normalizeImageSrc(src: string) {
  const trimmed = src.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http")) return trimmed;
  if (trimmed.startsWith("blob:")) return trimmed;
  if (trimmed.startsWith("data:")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `/${trimmed}`;
}

export function CreateProductModal() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const lastObjectUrlRef = useRef<string | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setImageUrl("");
    setFilePreviewUrl(null);
    if (lastObjectUrlRef.current) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
      lastObjectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
        lastObjectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    if (!open) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
        onClick={() => setOpen(true)}
      >
        Agregar producto
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40"
            aria-label="Cerrar"
            onClick={close}
          />

          <div className="relative z-10 w-full max-w-lg rounded-2xl border bg-background p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-lg font-semibold">
                  Crear producto
                </h2>
                <p className="text-sm text-foreground/70">
                  Completa los datos y guarda.
                </p>
              </div>
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
                onClick={close}
              >
                Cerrar
              </button>
            </div>

            <form
              className="mt-4"
              action={createProduct}
              encType="multipart/form-data"
              onSubmit={() => {
                close();
              }}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_220px]">
                <div className="grid grid-cols-1 gap-3">
                  <input
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                    name="name"
                    placeholder="Nombre"
                    required
                  />
                  <input
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                    name="description"
                    placeholder="Descripción"
                    required
                  />
                  <input
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                    name="priceCents"
                    placeholder="Precio (en centavos, ej: 1999 = 19.99)"
                    type="number"
                    min={1}
                    required
                  />

                  <div className="grid gap-1">
                    <label
                      className="text-sm font-medium text-foreground/80"
                      htmlFor="category"
                    >
                      Categoría
                    </label>
                    <select
                      id="category"
                      name="category"
                      defaultValue="OTROS"
                      className="rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-1">
                    <label
                      className="text-sm font-medium text-foreground/80"
                      htmlFor="image"
                    >
                      Foto (opcional)
                    </label>
                    <input
                      id="image"
                      className="rounded-md border bg-background px-3 py-2 text-sm"
                      name="image"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0] ?? null;
                        if (!file) {
                          setFilePreviewUrl(null);
                          return;
                        }

                        if (lastObjectUrlRef.current) {
                          URL.revokeObjectURL(lastObjectUrlRef.current);
                          lastObjectUrlRef.current = null;
                        }

                        const objectUrl = URL.createObjectURL(file);
                        lastObjectUrlRef.current = objectUrl;
                        setFilePreviewUrl(objectUrl);
                      }}
                    />
                    <div className="text-xs text-foreground/60">
                      JPG/PNG/WebP · máx 5MB
                    </div>
                  </div>

                  <input
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                    name="imageUrl"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.currentTarget.value);
                    }}
                    placeholder="Imagen URL (opcional, si no subes foto)"
                  />

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
                      onClick={close}
                    >
                      Cancelar
                    </button>
                    <button
                      className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                      type="submit"
                    >
                      Crear
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border bg-foreground/5 p-2">
                  <div className="text-xs font-medium text-foreground/70">
                    Preview
                  </div>
                  <div className="mt-2 aspect-[4/5] w-full overflow-hidden rounded-xl border bg-background">
                    {filePreviewUrl || imageUrl.trim() ? (
                      <img
                        src={normalizeImageSrc(filePreviewUrl ?? imageUrl)}
                        alt="Preview"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-foreground/60">
                        Sin imagen
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
