import { SiteHeader } from "@/components/SiteHeader";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </>
  );
}
