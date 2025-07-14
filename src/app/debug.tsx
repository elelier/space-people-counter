"use client";

import React, { useEffect, useState } from "react";

export default function DebugPage() {
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Crear un manejador para capturar errores de JavaScript
    const originalConsoleError = console.error;
    const errorHandler = (event: ErrorEvent) => {
      setErrors(prev => [...prev, `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`]);
      event.preventDefault();
    };

    // Sobrescribir console.error para capturar errores
    console.error = (...args) => {
      setErrors(prev => [...prev, args.join(' ')]);
      originalConsoleError.apply(console, args);
    };

    // Agregar manejadores de eventos
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', (event) => {
      setErrors(prev => [...prev, `Unhandled Promise Rejection: ${event.reason}`]);
    });

    // Limpiar
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', () => {});
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <div className="p-8 bg-slate-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Debugger - JavaScript Errors</h1>

      {errors.length === 0 ? (
        <div className="p-4 bg-green-800/30 rounded-lg border border-green-700">
          No JavaScript errors detected yet. Try navigating to other pages to trigger errors.
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-red-400">
            {errors.length} {errors.length === 1 ? 'Error' : 'Errors'} Detected
          </h2>

          <ul className="space-y-2">
            {errors.map((error, index) => (
              <li key={index} className="p-4 bg-red-800/30 rounded-lg border border-red-700 font-mono text-sm">
                {error}
              </li>
            ))}
          </ul>

          <button
            onClick={() => setErrors([])}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-medium"
          >
            Clear Errors
          </button>
        </div>
      )}
    </div>
  );
}
