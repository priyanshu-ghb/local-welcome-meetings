import type { AppProps } from 'next/app'
import '../styles/global.css'
import { usePosthog } from '../data/posthog';
import { UserContextProvider } from '../data/auth';

function MyApp({ Component, pageProps }: AppProps) {
  usePosthog()

  return (
    <UserContextProvider>
      <Component {...pageProps} />
    </UserContextProvider>
  )
}

export default MyApp
