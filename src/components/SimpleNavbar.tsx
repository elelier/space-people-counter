"use client";

import { useEffect } from "react";
import { Home, Users, MapPin, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function SimpleNavbar() {
  // Función para manejar el desplazamiento suave con offset
  const scrollToElement = (sectionId: string): void => {
    // Buscar el elemento objetivo por su id
    const targetElement = document.getElementById(sectionId);

    if (targetElement) {
      // Obtener la altura de la barra de navegación (con un pequeño margen extra)
      const navbarHeight = 70; // altura aproximada en píxeles

      // Calcular la posición de desplazamiento
      const offsetTop = targetElement.offsetTop - navbarHeight;

      // Realizar el desplazamiento suave
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  // Manejador para enlaces con etiqueta <a>
  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string): void => {
    e.preventDefault();
    scrollToElement(sectionId);
  };

  // Dedicated handler for the information button
  const handleInfoClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    scrollToElement("info");
  };

  // Función para detectar si estamos en la parte superior de la página
  useEffect(() => {
    // Ajustar el desplazamiento si la URL ya tiene un hash al cargar
    const handleInitialHash = (): void => {
      const { hash } = window.location;
      if (hash) {
        setTimeout(() => {
          const targetId = hash.substring(1);
          scrollToElement(targetId);
        }, 500); // pequeño retraso para asegurar que la página esté completamente cargada
      }
    };

    handleInitialHash();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-950/90 to-indigo-950/90 backdrop-blur-md border-b border-blue-900/50 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a
              href="#top"
              className="flex items-center gap-2 text-white text-lg font-bold"
              onClick={(e) => handleScrollToSection(e, "top")}
            >
              <Image
                src="/images/icons/icons8-space-shuttle-100.png"
                alt="Space Shuttle"
                width={24}
                height={24}
                className="logo-hover floating-slow"
              />
              <span className="link-hover">Space People</span>
            </a>
          </div>

          {/* Navegación para desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <a
              href="#top"
              className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-800/30 link-hover"
              onClick={(e) => handleScrollToSection(e, "top")}
            >
              Inicio
            </a>
            <a
              href="#misiones"
              className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-800/30 link-hover"
              onClick={(e) => handleScrollToSection(e, "misiones")}
            >
              Misiones
            </a>
            <a
              href="#estaciones"
              className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-800/30 link-hover"
              onClick={(e) => handleScrollToSection(e, "estaciones")}
            >
              Estaciones
            </a>
            <a
              href="#historial"
              className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-800/30 link-hover"
              onClick={(e) => handleScrollToSection(e, "historial")}
            >
              Historia
            </a>
            <a
              href="/validation"
              className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-800/30 link-hover"
            >
              🔍 Validar
            </a>
            <a
              href="#info"
              className="ml-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 button-hover"
              onClick={handleInfoClick}
            >
              Más información
            </a>
          </div>

          {/* Navegación para móvil (simplificada) */}
          <div className="flex md:hidden items-center space-x-1">
            <a
              href="#top"
              className="p-2 rounded-md text-white hover:bg-blue-800/30 icon-hover"
              title="Inicio"
              onClick={(e) => handleScrollToSection(e, "top")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </a>
            <a
              href="#misiones"
              className="p-2 rounded-md text-white hover:bg-blue-800/30 icon-hover"
              title="Misiones"
              onClick={(e) => handleScrollToSection(e, "misiones")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </a>
            <a
              href="#estaciones"
              className="p-2 rounded-md text-white hover:bg-blue-800/30 icon-hover"
              title="Estaciones"
              onClick={(e) => handleScrollToSection(e, "estaciones")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                <path d="M2 12h20"></path>
              </svg>
            </a>
            <a
              href="#historial"
              className="p-2 rounded-md text-white hover:bg-blue-800/30 icon-hover"
              title="Historia"
              onClick={(e) => handleScrollToSection(e, "historial")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </a>
            <a
              href="#info"
              className="p-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 icon-hover"
              title="Más información"
              onClick={handleInfoClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
