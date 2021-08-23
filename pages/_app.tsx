import type { AppProps } from 'next/app'
import '../styles/global.css'
import { usePosthog } from '../data/posthog';

function MyApp({ Component, pageProps }: AppProps) {
  usePosthog()

  return (
    <Component {...pageProps} />
  )
}

export default MyApp
