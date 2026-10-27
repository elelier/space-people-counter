"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordShareEvent } from "@/lib/analytics";
import { SHARE_URL, sharePage, type ShareResult } from "@/lib/sharePage";

const messages: Record<ShareResult, string> = {
  shared: "¡Gracias por compartir!",
  copied: "Enlace copiado. ¡Compártelo donde quieras!",
  cancelled: "Compartir cancelado.",
  error: "No se pudo compartir. Puedes copiar la dirección desde tu navegador.",
};

export function ShareButton() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ShareResult | null>(null);

  const handleShare = async () => {
    if (pending) return;
    setPending(true);
    setResult(null);

    try {
      const outcome = await sharePage({
        share: typeof navigator.share === "function"
          ? (data) => navigator.share(data)
          : undefined,
        copy: navigator.clipboard?.writeText
          ? (url) => navigator.clipboard.writeText(url)
          : undefined,
        track: (method) => recordShareEvent(window, method, SHARE_URL),
      });
      setResult(outcome);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        onClick={handleShare}
        disabled={pending}
        variant="outline"
        className="min-h-11 px-5 border-blue-400/60 bg-blue-700/30 text-white hover:bg-blue-600/40 hover:text-white"
      >
        <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
        {pending ? "Compartiendo..." : "Compartir esta página"}
      </Button>
      <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-blue-100 min-h-5">
        {result ? messages[result] : ""}
      </p>
    </div>
  );
}
