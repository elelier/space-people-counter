"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SpaceBackgroundProps {
  children: ReactNode;
}

export function SpaceBackground({ children }: SpaceBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-950 via-indigo-950 to-black">
      {/* Planetas */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-blue-900 opacity-10 blur-3xl"
        style={{
          top: '20%',
          left: '-20%',
        }}
        animate={{
          x: [0, 20, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-purple-600 opacity-10 blur-3xl"
        style={{
          bottom: '10%',
          right: '-10%',
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Líneas de cuadrícula */}
      <div className="absolute inset-0 grid grid-cols-12 gap-4 opacity-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`col-${i}`} className="h-full w-px bg-blue-500/30" />
        ))}
      </div>

      <div className="absolute inset-0 grid grid-rows-12 gap-4 opacity-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`row-${i}`} className="w-full h-px bg-blue-500/30" />
        ))}
      </div>

      {/* Contenido */}
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
}
