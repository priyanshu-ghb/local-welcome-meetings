import type { AppProps } from 'next/app'
import '../styles/global.css'
import { usePosthog } from '../data/posthog';
import { UserContextProvider } from '../data/auth';
import { TimeProvider } from '../data/time';
import { useRouter } from 'next/dist/client/router';
import { useEffect } from 'react';
import qs from 'query-string';

function MyApp({ Component, pageProps }: AppProps) {
  usePosthog()
  const router = useRouter()
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = qs.parse(window.location.hash);
      if (hash.type === 'recovery') {
        router.push('/update-password')
      }
    }
  }, [router])

  return (
    <TimeProvider>
      <UserContextProvider>
        <Component {...pageProps} />
      </UserContextProvider>
    </TimeProvider>
  )
}

export default MyApp
