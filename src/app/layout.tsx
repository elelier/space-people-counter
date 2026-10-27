import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { getSocialImageUrl } from "@/lib/socialMetadata";

const socialImageUrl = getSocialImageUrl(process.env.CF_PAGES_BRANCH, process.env.CF_PAGES_URL);

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

// Viewport configuration (separado del metadata en Next.js 15)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://spacepeople.elelier.com'),
  title: "Space People Counter - ¿Cuántas personas hay en el espacio ahora?",
  description: "¿Cuántas personas hay en el espacio ahora? Consulta el contador de astronautas, sus misiones y la ubicación de la ISS.",
  alternates: { canonical: '/' },
  keywords: ["espacio", "astronautas", "ISS", "estación espacial", "tiempo real", "NASA"],
  authors: [{ name: "elelier", url: "https://www.elelier.com" }],
  creator: "elelier",
  publisher: "elelier",
  
  // Configuración del favicon y iconos
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '100x100' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '100x100', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  
  // Open Graph para redes sociales
  openGraph: {
    title: "¿Cuántas personas hay en el espacio ahora? | Space People Counter",
    description: "Descubre cuántas personas están en el espacio y quiénes son. Consulta el contador actualizado.",
    url: "https://spacepeople.elelier.com/",
    siteName: "Space People Counter",
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: "La Tierra vista desde el espacio, un astronauta y la pregunta: ¿Cuántas personas hay en el espacio ahora?",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "¿Cuántas personas hay en el espacio ahora?",
    description: "Descubre el contador actualizado de astronautas y sus misiones.",
    images: [socialImageUrl],
  },
  
  // Configuración adicional
  manifest: "/manifest.json",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${mono.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeWrapper>
          {children}
        </ThemeWrapper>
      </body>
    </html>
  );
}
