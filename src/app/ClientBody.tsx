"use client";

import { useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import { ThemeWrapper } from "@/components/ThemeWrapper";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.className = "antialiased"; // Asegura que el body tenga la clase
  }, []);

  return (
    <body className="antialiased" suppressHydrationWarning>
      <ThemeWrapper>
        {children}
      </ThemeWrapper>
    </body>
  );
}
