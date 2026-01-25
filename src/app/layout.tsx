import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeWrapper } from "@/components/ThemeWrapper";

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
  description: "¿Alguna vez te has preguntado cuántas personas hay en el espacio ahora? Visita Space People! ubicación de la ISS y datos de misiones espaciales activas",
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
    title: "Space People Counter",
    description: "Contador en tiempo real de personas en el espacio exterior",
    url: "https://spacepeople.elelier.com",
    siteName: "Space People Counter",
    images: [
      {
        url: "/favicon.png",
        width: 100,
        height: 100,
        alt: "Space People Counter Logo",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  
  // Twitter Card
  twitter: {
    card: "summary",
    title: "Space People Counter",
    description: "Contador en tiempo real de personas en el espacio exterior",
    images: ["/favicon.png"],
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
