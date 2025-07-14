"use client";

interface AstronautImageProps {
  name: string;
  className?: string;
}

/**
 * Componente que muestra las iniciales del astronauta en un círculo con gradiente
 * Simplificado para evitar errores
 */
export function AstronautImage({ name, className = "" }: AstronautImageProps) {
  // Obtener iniciales del nombre
  const initials = name
    .split(' ')
    .map(n => n.charAt(0))
    .join('');

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium ${className}`}
    >
      {initials}
    </div>
  );
}
