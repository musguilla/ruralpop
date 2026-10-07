import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EquipopFooter } from "@/components/layout/EquipopFooter";
import { getServerTenantSlug, getServerTenantDomain } from "@/utils/tenant/server";
import { NotificationProvider } from "@/context/NotificationContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { getCategories, getActiveEquipopSubcategories } from "@/utils/categoriesFetcher";
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
  const currentDomain = await getServerTenantDomain();
  const isEquipop = tenant === 'equipop' || currentDomain.includes('equipop');

  const isPt = locale === 'pt';
  
  const title = isEquipop 
    ? (isPt ? "Equipop - Vende e compra material equestre em segunda mão" : "Equipop - Vende y compra material hípico segunda mano")
    : (isPt ? "Ruralpop - App grátis para comprar e vender gado" : "Ruralpop - App gratis para comprar y vender ganado");

  const description = isEquipop
    ? (isPt ? "App grátis para vender, comprar e pesquisar material e equipamentos equestres." : "App gratis para vender, comprar y buscar material y equipamientos hípicos.")
    : (isPt ? "App móvel grátis para pesquisar, vender e comprar gado, máquinas, alimentação, forragem e encontrar serviços profissionais. Vacas, cavalos, ovelhas, cabras, galinhas ... de agricultores para agricultores." : "App móvil gratis para buscar, vender y comprar ganado, maquinaria, alimentación, forraje y encontrar servicios profesionales. Vacas, caballos, ovejas, cabras, gallinas ... de ganaderos para ganaderos.");

  const metadataObj: Metadata = {
    metadataBase: new URL(currentDomain),
    alternates: {
      canonical: getCanonicalUrl(originalPathname, locale, currentDomain),
      languages: getHreflangLinks(originalPathname, currentDomain),
    },
    title: title,
    description: description,
    applicationName: isEquipop ? "Equipop" : "Ruralpop",
    icons: {
      icon: isEquipop 
        ? [
            { url: '/equipop-favicon.png', type: 'image/png', sizes: '512x512' },
          ]
        : [
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/favicon.png', type: 'image/png' },
          ],
      apple: [
        { 
          url: isEquipop ? '/equipop-favicon.png' : '/apple-touch-icon.png', 
          sizes: isEquipop ? '512x512' : '180x180', 
          type: 'image/png' 
        },
      ],
    },
    openGraph: {
      title: title,
      description: description,
      url: currentDomain,
      siteName: isEquipop ? "Equipop" : "Ruralpop",
      images: [
        {
          url: isEquipop ? `${currentDomain}/equipop-logo.png` : `${currentDomain}/ruralpop-logo.png`,
          width: 512,
          height: 512,
        }
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [isEquipop ? `${currentDomain}/equipop-logo.png` : `${currentDomain}/ruralpop-logo.png`],
    },
    appleWebApp: {
      title: isEquipop ? "Equipop" : "Ruralpop",
      statusBarStyle: "default",
    },
    itunes: {
      appId: isEquipop ? "6778118647" : "6759678666"
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
      ...(isEquipop ? {} : { "google-adsense-account": "ca-pub-2042067618462129" })
    }
  };

  // Layout handles default robots indexing


  return metadataObj;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
  const originalPathname = headersList.get('x-original-pathname') || '';
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || '';
  const isAdmin = originalPathname.startsWith('/admin');
  const dictionary = await getDictionary(locale);
  const tenant = await getServerTenantSlug();
  const categories = await getCategories(tenant || 'ruralpop', locale);
  
  const isPt = locale === 'pt' || host.includes('ruralpop.pt');
  const gaId = isPt 
    ? (process.env.NEXT_PUBLIC_GA_PT_ID || 'G-RCFLZ0JRZ4') 
    : (process.env.NEXT_PUBLIC_GA_ID || 'G-RTTVCPX0XQ');
  
  // Fetch active subcategories for Equipop SEO tabs
  let activeEquipopData: { categories: string[], subcategories: string[] } = { categories: [], subcategories: [] };
  if (tenant === 'equipop') {
      activeEquipopData = await getActiveEquipopSubcategories();
  }

  return (
    <html lang={locale}>
      {tenant === 'equipop' && (
        <head>
          <style>{`
            :root {
              --ag-sys-color-primary: #1E3A8A;
              --ag-sys-color-primary-hover: #1E40AF;
              --ag-sys-color-primary-muted: #DBEAFE;
              --ag-sys-color-badge-bg: #EFF6FF;
              --ag-sys-color-badge-text: #1E40AF;
            }
          `}</style>
        </head>
      )}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* Google Analytics */}
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${gaId}');
          `}
        </Script>
        {/* Google AdSense */}
        {tenant !== 'equipop' && !isAdmin && (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2042067618462129"
            crossOrigin="anonymous"
          ></script>
        )}
        <LocaleProvider locale={locale} dictionary={dictionary}>
          <CategoriesProvider categories={categories}>
          <NotificationProvider>
            <Header />
            <main className="flex-1 w-full flex flex-col items-center">
              {children}
            </main>
            <SeoFooterTabs activeEquipopData={activeEquipopData} />
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
 * - Smart App Banner (itunes.appId): Apple iOS (Safari e iMessage/SMS) inspecciona la metaetiqueta
 *   'apple-itunes-app' para renderizar la tarjeta de previsualización en mensajes y el banner superior de Safari.
 *   Se aísla estrictamente el App ID: '6778118647' para Equipop y '6759678666' para Ruralpop. Si se hardcodea
 *   Ruralpop en Equipop, iOS convierte cualquier enlace compartido en la tarjeta de la App de Ruralpop.
 */
