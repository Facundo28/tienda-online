import Link from "next/link";

export function TopSearchBar() {
  return (
    <div className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-3">
        <form action="/products" method="get" className="w-full max-w-xl">
          <label className="sr-only" htmlFor="top-search">
            Buscar
          </label>
          <div className="flex items-center gap-2">
            <input
              id="top-search"
              name="q"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Buscar productos..."
            />
            <button type="submit" className="sr-only">
              Buscar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
