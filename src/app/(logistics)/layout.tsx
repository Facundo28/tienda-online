import { Toaster } from "sonner";
import { SiteHeader } from "@/components/SiteHeader"; // Optional: Add global header or keep empty

// This layout is now a clean container. 
// Driver app has its own layout in /delivery/layout.tsx
// Fleet Admin dashboard in /logistics/page.tsx has its own structure or could use a new /logistics/layout.tsx

export default function LogisticsGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
      <Toaster richColors position="top-center" />
    </div>
  );
}
