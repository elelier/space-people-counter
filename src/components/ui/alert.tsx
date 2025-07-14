import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

export interface AlertProps {
  title: string;
  message?: string;
  type?: AlertType;
  isOpen: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function Alert({
  title,
  message,
  type = 'info',
  isOpen,
  onClose,
  autoClose = true,
  duration = 5000
}: AlertProps) {
  // Si autoClose es true, cerrar automáticamente después de 'duration' ms
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose]);

  // Determinar el ícono según el tipo
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // Determinar los colores según el tipo
  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md shadow-lg rounded-lg border p-4',
            'backdrop-blur-sm',
            getColorClasses()
          )}
        >
          <div className="flex">
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
              {message && <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</div>}
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                >
                  <span className="sr-only">Cerrar</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
