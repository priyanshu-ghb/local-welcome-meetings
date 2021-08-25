import { useEffect, useLayoutEffect } from 'react';
import { useRouter } from 'next/dist/client/router';
import { isClient } from '../styles/screens';

export function usePosthog() {
  useLayoutEffect(function posthogAnalytics() {
    // @ts-ignore
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    if (isClient && process.env.NODE_ENV === 'production') {
      // @ts-ignore
      posthog?.init?.(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, {api_host:'https://app.posthog.com'})
    }
  }, [])

  const handleBeforeHistoryChange = () => {
    // @ts-ignore
    posthog?.register?.({
      $referrer: String(window.location),
      $referring_domain: String(window.location.host)
    })
  }

  const handleRouteChangeComplete = () => {
    // @ts-ignore
    posthog?.capture?.('$pageview')
  }

  const router = useRouter()

  useEffect(() => {
    router.events.on('beforeHistoryChange', handleBeforeHistoryChange)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      router.events.off('beforeHistoryChange', handleBeforeHistoryChange)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [router])
}