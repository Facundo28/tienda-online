import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { CartProvider } from "@/lib/cart/CartContext";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Market E.C",
  description: "La plataforma más segura para comprar y vender cerca de ti.",
  icons: {
    icon: "/icon-cropped.png?v=3",
    shortcut: "/icon-cropped.png?v=3",
    apple: "/icon-cropped.png?v=3",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${outfit.variable} font-sans min-h-screen bg-background text-foreground antialiased`}
        suppressHydrationWarning={true}
      >
        <CartProvider>
          {children}
          <Toaster richColors position="top-center" />
        </CartProvider>
      </body>

    </html>
  );
}
