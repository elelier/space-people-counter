import Script from 'next/script'
import { getGaBootstrapScript } from '@/lib/analytics'

const GA_MEASUREMENT_ID = 'G-8KTLDRRQTP'

export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        async
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {getGaBootstrapScript(GA_MEASUREMENT_ID)}
      </Script>
    </>
  )
}
