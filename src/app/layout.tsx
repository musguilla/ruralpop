import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NotificationProvider } from "@/context/NotificationContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { getCategories } from "@/utils/categoriesFetcher";
import { SeoFooterTabs } from "@/components/layout/SeoFooterTabs";
import Script from "next/script";

import { CookieBanner } from "@/components/layout/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ruralpop.com"),
  title: "Ruralpop - App gratis para comprar y vender ganado",
  description: "App móvil gratis para buscar, vender y comprar ganado, maquinaria, alimentación, forraje y encontrar servicios profesionales. Vacas, caballos, ovejas, cabras, gallinas ... de ganaderos para ganaderos.",
  applicationName: "Ruralpop",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    title: "Ruralpop",
    statusBarStyle: "default",
  },
  itunes: {
    appId: "6759678666"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    "google-adsense-account": "ca-pub-2042067618462129"
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col font-sans antialiased`}
      >
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-RTTVCPX0XQ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-RTTVCPX0XQ');
          `}
        </Script>
        {/* Google AdSense (script nativo en HTML pelado para evitar bloqueos del crawler de Adsense al verificar dominio) */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2042067618462129"
          crossOrigin="anonymous"
        ></script>
        <CategoriesProvider categories={categories}>
          <NotificationProvider>
            <Header />
            <main className="flex-1 w-full flex flex-col items-center">
              {children}
            </main>
            <SeoFooterTabs />
            <Footer />
            <CookieBanner />
          </NotificationProvider>
        </CategoriesProvider>
      </body>
    </html>
  );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se cambia lang="es" ya que la aplicación es para el mercado agrícola hispanohablante.
 * - <body className="min-h-screen flex flex-col"> asegura que el Footer siempre se pegue al final incluso con poco contenido.
 * - Aliases absolutos asegurados "@/components/...".
 */
