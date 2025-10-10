import type { Metadata } from "next";
import "@/app/globals.css";
import { cormorant, inter, allura } from "./fonts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "EliAtis – Bijoux",
  description: "Bijoux faits main – colliers, boucles, bagues, bracelets.",
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
        {children}
      </body>
    </html>
  );
}
