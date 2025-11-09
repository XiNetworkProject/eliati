import type { Metadata } from "next";
import "@/app/globals.css";
import { cormorant, inter, allura } from "./fonts";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/contexts/CartContext";

export const metadata: Metadata = {
  title: "EliAti – Bijoux",
  description: "Bijoux faits main – colliers, boucles, bagues, bracelets.",
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
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
