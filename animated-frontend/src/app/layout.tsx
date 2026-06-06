import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import CustomCursor from "@/components/CustomCursor";
import GridLines from "@/components/GridLines";

// Luxury heading font (Google Fonts)
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Clean body font (Google Fonts)
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

// Premium SEO optimization
export const metadata: Metadata = {
  title: "AETERNA | Luxury Classical Sculpture Exhibition",
  description:
    "Experience the eternal beauty of Roman and Greek classical sculpture. A digital exhibition curation from Museion Department of Antiquities, Paris.",
  openGraph: {
    title: "AETERNA | Luxury Classical Sculpture Exhibition",
    description: "Curated Roman and Greek classical antiquities in ultra-high resolution.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-luxury-black text-white font-sans selection:bg-gold selection:text-luxury-black relative overflow-x-hidden">
        {/* Grain Noise Overlay for organic cinematic texture */}
        <div className="noise-overlay" />

        {/* Global Lenis scroll wrapper */}
        <LenisProvider>
          {/* Mouse follow lights & pointer tracker */}
          <CustomCursor />

          {/* Vertical layout lines */}
          <GridLines />

          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
