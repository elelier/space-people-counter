"use client";

import { ReactNode } from "react";

interface ThemeWrapperProps {
  children: ReactNode;
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  // Usar valores fijos basados en el tema espacio en lugar de dinámicos
  const themeStyles = {
    "--theme-primary": "#1e3a8a",
    "--theme-secondary": "#312e81",
    "--theme-accent": "#3b82f6",
    "--theme-bg-start": "#0f172a",
    "--theme-bg-end": "#020617",
    "--theme-text-primary": "#f8fafc",
    "--theme-text-secondary": "#94a3b8",
    "--theme-card-bg": "rgba(15, 23, 42, 0.8)",
    "--theme-card-border": "#1e3a8a",
    "--theme-progress-bg": "#1e293b",
    "--theme-progress-fill": "linear-gradient(to right, #2563eb, #4f46e5)",
    "--theme-button-bg": "#1e40af",
    "--theme-button-text": "#f8fafc",
    "--theme-button-hover": "#2563eb",
  } as React.CSSProperties;

  return (
    <div
      style={themeStyles}
      className="min-h-screen bg-gradient-to-b from-[var(--theme-bg-start)] to-[var(--theme-bg-end)] transition-colors duration-300"
    >
      {children}
    </div>
  );
}
