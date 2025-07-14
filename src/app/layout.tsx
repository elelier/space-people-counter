import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Space People Counter - ¿Cuántas personas hay en el espacio ahora?",
  description: "Contador en tiempo real de personas en el espacio exterior, ubicación de la ISS y datos de misiones espaciales activas",
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
    url: "https://space-people.netlify.app",
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
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <ClientBody>
        {children}
      </ClientBody>
    </html>
  );
}
