import type { NextPage } from 'next'
import Head from 'next/head'
import Auth from '../components/Auth';
import { Logo } from '../components/Branding';
import { Header } from '../components/Layout';

type IProps = {}

const Page: NextPage<IProps> = () => {
  return (
    <div className='bg-adhdPurple min-h-screen text-adhdBlue'>
      <Head>
        <title>Update password - ADHD Together</title>
        <meta name="description" content="Session rooms for ADHD Together" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='bg-gray-100 min-h-screen w-screen'>
        <Header />
        <main className='max-w-5xl mx-auto p-5 space-y-4 py-7'>
          <Auth view='update_password' redirectTo={'/'} />
        </main>
      </div>
    </div>
  )
}

export default Page
