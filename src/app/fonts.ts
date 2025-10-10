import { Cormorant_Garamond, Inter, Allura } from "next/font/google";

export const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"]
});

export const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

export const allura = Allura({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-allura" 
});

