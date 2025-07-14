"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, InfoIcon, Users, MapPin } from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detectar scroll para cambiar la apariencia de la barra de navegación
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Cerrar el menú móvil cuando la pantalla se redimensiona a tamaño desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileMenuOpen]);

  // Bloquear el scroll cuando el menú está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          scrolled || mobileMenuOpen ? "bg-black/80 backdrop-blur-lg shadow-md" : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/images/icons/icons8-space-shuttle-100.png"
                  alt="Space Shuttle"
                  width={24}
                  height={24}
                  className="text-blue-400"
                />
                <span className="text-white font-bold text-xl">Space People</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-blue-100 hover:text-white transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </Link>
              <Link href="#misiones" className="text-blue-100 hover:text-white transition-colors flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Misiones</span>
              </Link>
              <Link href="#estaciones" className="text-blue-100 hover:text-white transition-colors flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Estaciones</span>
              </Link>
              <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400/10 flex items-center gap-1">
                <InfoIcon className="w-4 h-4" />
                <span>Más información</span>
              </Button>
            </nav>

            <div className="flex md:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
                onClick={toggleMobileMenu}
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Fondo oscuro para el menú móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menú móvil deslizante desde la izquierda */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed top-0 left-0 bottom-0 z-50 md:hidden w-1/2 bg-blue-950/95 backdrop-blur-md pt-16 overflow-y-auto shadow-xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex flex-col px-4 py-2 space-y-1">
              <div className="border-b border-blue-800/50 pb-4 mb-2">
                <Link
                  href="/"
                  className="flex items-center space-x-2 mb-6"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Image
                    src="/images/icons/icons8-space-shuttle-100.png"
                    alt="Space Shuttle"
                    width={20}
                    height={20}
                    className="text-blue-400"
                  />
                  <span className="text-white font-bold text-lg">Space People</span>
                </Link>
              </div>

              <Link
                href="/"
                className="text-white text-base py-3 px-4 rounded-lg hover:bg-blue-900/40 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4 text-blue-300" />
                Inicio
              </Link>
              <Link
                href="#misiones"
                className="text-white text-base py-3 px-4 rounded-lg hover:bg-blue-900/40 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="w-4 h-4 text-blue-300" />
                Misiones
              </Link>
              <Link
                href="#estaciones"
                className="text-white text-base py-3 px-4 rounded-lg hover:bg-blue-900/40 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MapPin className="w-4 h-4 text-blue-300" />
                Estaciones
              </Link>

              <div className="pt-4 mt-4 border-t border-blue-800/50">
                <Button
                  variant="outline"
                  className="border-blue-400 text-blue-400 hover:bg-blue-400/10 w-full flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <InfoIcon className="w-4 h-4" />
                  Más información
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante para volver al inicio (visible solo cuando se hace scroll) */}
      {scrolled && (
        <>
          {/* Versión para escritorio */}
          <motion.div
            className="fixed bottom-6 right-6 rounded-full shadow-lg z-50 hidden md:block"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Link href="#" aria-label="Volver al inicio">
              <Button
                size="icon"
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                title="Volver al inicio"
              >
                <Image
                  src="/images/icons/icons8-space-shuttle-100.png"
                  alt="Space Shuttle"
                  width={24}
                  height={24}
                />
              </Button>
            </Link>
          </motion.div>

          {/* Versión para móvil */}
          <motion.div
            className="fixed bottom-4 right-4 rounded-full shadow-lg z-50 md:hidden"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Link href="#" aria-label="Volver al inicio">
              <Button
                size="icon"
                className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                title="Volver al inicio"
              >
                <Image
                  src="/images/icons/icons8-space-shuttle-100.png"
                  alt="Space Shuttle"
                  width={20}
                  height={20}
                />
              </Button>
            </Link>
          </motion.div>
        </>
      )}
    </>
  );
}
