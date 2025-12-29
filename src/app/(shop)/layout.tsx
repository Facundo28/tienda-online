import { SiteHeader } from "@/components/SiteHeader";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-8 flex-1">{children}</main>
    </div>
  );
}
