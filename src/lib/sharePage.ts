export const SHARE_URL = "https://spacepeople.elelier.com/";

export const SHARE_TITLE = "¿Cuántas personas hay en el espacio ahora?";

export type ShareMethod = "native" | "clipboard";
export type ShareResult = "shared" | "copied" | "cancelled" | "error";

export interface ShareActions {
  share?: (data: { title: string; text: string; url: string }) => Promise<void>;
  copy?: (url: string) => Promise<void>;
  track?: (method: ShareMethod) => void;
}

export async function sharePage(actions: ShareActions): Promise<ShareResult> {
  const trackSuccess = (method: ShareMethod) => {
    try {
      actions.track?.(method);
    } catch {
      // Analytics must never turn a successful share into a UI error.
    }
  };

  if (actions.share) {
    try {
      await actions.share({
        title: SHARE_TITLE,
        text: "Consulta quién está ahora en el espacio.",
        url: SHARE_URL,
      });
      trackSuccess("native");
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return "cancelled";
      }
      // Native sharing can fail on some browsers. Try the clipboard instead.
    }
  }

  if (actions.copy) {
    try {
      await actions.copy(SHARE_URL);
      trackSuccess("clipboard");
      return "copied";
    } catch {
      return "error";
    }
  }

  return "error";
}
