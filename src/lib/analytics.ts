export type ShareAnalyticsPayload = {
  method: "native" | "clipboard";
  content_type: "website";
  item_id: string;
};

interface AnalyticsTarget {
  gtag?: (command: "event", eventName: "share", params: ShareAnalyticsPayload) => void;
  __spcPendingShareEvents?: ShareAnalyticsPayload[];
}

export function recordShareEvent(target: AnalyticsTarget, method: ShareAnalyticsPayload["method"], url: string) {
  const payload: ShareAnalyticsPayload = { method, content_type: "website", item_id: url };

  if (typeof target.gtag === "function") {
    target.gtag("event", "share", payload);
  } else {
    (target.__spcPendingShareEvents ??= []).push(payload);
  }
}

export function getGaBootstrapScript(measurementId: string): string {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', ${JSON.stringify(measurementId)});
    (window.__spcPendingShareEvents || []).forEach(function(event) {
      gtag('event', 'share', event);
    });
    window.__spcPendingShareEvents = [];
  `;
}
