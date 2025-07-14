"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface UpdateCountdownProps {
  onComplete: () => void;
  interval: number; // en milisegundos
  className?: string;
}

export function UpdateCountdown({ onComplete, interval, className = "" }: UpdateCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(interval);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          // Call onComplete safely
          try {
            onComplete();
          } catch (error) {
            console.error("Error calling onComplete:", error);
          }
          return interval;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interval, onComplete]);

  useEffect(() => {
    setProgress((timeLeft / interval) * 100);
  }, [timeLeft, interval]);

  // Convertir milisegundos a formato mm:ss
  const minutes = Math.floor((timeLeft / 1000) / 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-xs text-blue-300">
        <span>Próxima actualización</span>
        <span>{formattedTime}</span>
      </div>
      <Progress value={progress} className="h-1" />
    </div>
  );
}
