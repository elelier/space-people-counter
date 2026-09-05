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

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const title = "¿Cuántas personas hay en el espacio ahora? | Space People";
const description =
  "Consulta cuántas personas hay en el espacio ahora, quiénes están en órbita y dónde está la ISS. Datos públicos con estado en vivo o de respaldo claramente visible.";

export const metadata: Metadata = {
  metadataBase: new URL("https://spacepeople.elelier.com"),
  title,
  description,
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "elelier", url: "https://www.elelier.com" }],
  creator: "elelier",
  publisher: "elelier",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "100x100" },
    ],
    apple: [{ url: "/favicon.png", sizes: "100x100", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Space People",
    images: [
      {
        url: "/og-space-people.png",
        width: 1200,
        height: 630,
        alt: "Space People: descubre cuántas personas están ahora mismo en el espacio",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-space-people.png"],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className={`${inter.variable} ${mono.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeWrapper>{children}</ThemeWrapper>
      </body>
    </html>
  );
}
