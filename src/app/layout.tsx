import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EquipopFooter } from "@/components/layout/EquipopFooter";
import { getServerTenantSlug } from "@/utils/tenant/server";
import { NotificationProvider } from "@/context/NotificationContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { getCategories } from "@/utils/categoriesFetcher";
import { SeoFooterTabs } from "@/components/layout/SeoFooterTabs";
import Script from "next/script";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { headers } from "next/headers";
import { ptIndexableRoutes, LocaleCode } from "@/i18n/config";
import { getHreflangLinks, getCanonicalUrl } from "@/i18n/utils";
import { LocaleProvider } from "@/context/LocaleContext";
import { getDictionary } from "@/i18n/dictionaries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
  const originalPathname = headersList.get('x-original-pathname') || '/';
  const tenant = await getServerTenantSlug();

  const isEquipop = tenant === 'equipop';

  const metadataObj: Metadata = {
    metadataBase: new URL("https://www.ruralpop.com"),
    alternates: {
      canonical: getCanonicalUrl(originalPathname, locale),
      languages: getHreflangLinks(originalPathname),
    },
    title: isEquipop 
      ? "Equipop - Material equitación segunda mano" 
      : "Ruralpop - App gratis para comprar y vender ganado",
    description: isEquipop
      ? "App móvil gratis para buscar, vender y comprar caballos, accesorios, monturas y encontrar servicios ecuestres."
      : "App móvil gratis para buscar, vender y comprar ganado, maquinaria, alimentación, forraje y encontrar servicios profesionales. Vacas, caballos, ovejas, cabras, gallinas ... de ganaderos para ganaderos.",
    applicationName: isEquipop ? "Equipop" : "Ruralpop",
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
      title: isEquipop ? "Equipop" : "Ruralpop",
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

  // Enforce noindex for Portuguese routes that are not explicitly approved
  if (locale === 'pt' && !ptIndexableRoutes.includes(originalPathname)) {
    metadataObj.robots = { index: false, follow: true };
  }

  return metadataObj;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
  const dictionary = await getDictionary(locale);
  const tenant = await getServerTenantSlug();
  const categories = await getCategories(tenant || 'ruralpop');

  return (
    <html lang={locale}>
      {tenant === 'equipop' && (
        <head>
          <style>{`
            :root {
              --ag-sys-color-primary: #7bceb4;
              --ag-sys-color-primary-hover: #96f1d6;
            }
          `}</style>
        </head>
      )}
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
        <LocaleProvider locale={locale} dictionary={dictionary}>
          <CategoriesProvider categories={categories}>
          <NotificationProvider>
            <Header />
            <main className="flex-1 w-full flex flex-col items-center">
              {children}
            </main>
            <SeoFooterTabs />
            {tenant === 'equipop' ? <EquipopFooter /> : <Footer />}
            <CookieBanner />
          </NotificationProvider>
        </CategoriesProvider>
        </LocaleProvider>
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
