import type { Metadata } from "next";
import "@/app/globals.css";
import { cormorant, inter, allura } from "./fonts";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/contexts/CartContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { getSiteConfig } from "@/lib/site-settings";
import { DEFAULT_SITE_CONFIG } from "@/lib/site-settings-defaults";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const fallback = DEFAULT_SITE_CONFIG;

  const title = config.meta_title || config.site_name || fallback.meta_title;
  const description = config.meta_description || fallback.meta_description;
  const favicon = config.favicon_url || "/favicon.svg";
  const keywords = config.meta_keywords || fallback.meta_keywords;

  return {
    title,
    description,
    keywords,
    icons: {
      icon: favicon,
      apple: favicon,
      shortcut: favicon,
    },
  };
}

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
          <CompareProvider>
            <SiteSettingsProvider>{children}</SiteSettingsProvider>
          </CompareProvider>
        </CartProvider>
      </body>
    </html>
  );
}
