import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NotificationProvider } from "@/context/NotificationContext";
import { InstallBanner } from "@/components/layout/InstallBanner";
import { SeoFooterTabs } from "@/components/layout/SeoFooterTabs";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ruralpop - Compra y Venta del Campo",
  description: "El mercado líder en compra y venta de ganadería, maquinaria y productos del campo. Para el entorno rural de toda España.",
  applicationName: "Ruralpop",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    title: "Ruralpop",
    statusBarStyle: "default",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col font-sans antialiased`}
      >
        <NotificationProvider>
          <InstallBanner />
          <Header />
          <main className="flex-1 w-full flex flex-col items-center">
            {children}
          </main>
          <SeoFooterTabs />
          <Footer />
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
