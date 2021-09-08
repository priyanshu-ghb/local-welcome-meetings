import type { AppProps } from 'next/app'
import '../styles/global.css'
import { usePosthog } from '../data/posthog';
import { UserContextProvider } from '../data/auth';
import { TimeProvider } from '../data/time';

function MyApp({ Component, pageProps }: AppProps) {
  usePosthog()

  return (
    <TimeProvider>
      <UserContextProvider>
        <Component {...pageProps} />
      </UserContextProvider>
    </TimeProvider>
  )
}

export default MyApp
