import type { ShareAnalyticsPayload } from '@/lib/analytics';

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, string | number | boolean>
    ) => void;
    dataLayer: Array<Record<string, unknown>>;
    __spcPendingShareEvents?: ShareAnalyticsPayload[];
  }
}

export {};
