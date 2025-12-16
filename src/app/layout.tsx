import type { Metadata } from "next";
import "@/app/globals.css";
import { cormorant, inter, allura } from "./fonts";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/contexts/CartContext";
import { CompareProvider } from "@/contexts/CompareContext";

export const metadata: Metadata = {
  title: "EliAti - Bijoux",
  description: "Bijoux faits main - colliers, boucles, bagues, bracelets.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={cn(
          inter.variable,
          cormorant.variable,
          allura.variable,
          "bg-ivory text-leather antialiased"
        )}
      >
        <CompareProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </CompareProvider>
      </body>
    </html>
  );
}
