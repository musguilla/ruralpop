import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NotificationProvider } from "@/context/NotificationContext";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="google-adsense-account" content="ca-pub-2042067618462129" />
        <link rel="icon" href="https://www.ruralpop.com/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="https://www.ruralpop.com/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="https://www.ruralpop.com/apple-touch-icon.png" />
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
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2042067618462129"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col font-sans antialiased`}
      >
        <NotificationProvider>
          <Header />
          <main className="flex-1 w-full flex flex-col items-center">
            {children}
          </main>
          <SeoFooterTabs />
          <Footer />
          <CookieBanner />
        </NotificationProvider>
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
