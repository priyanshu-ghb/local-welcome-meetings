import type { NextPage } from 'next'
import Head from 'next/head'
import Auth from '../components/Auth';
import { Logo } from '../components/Branding';
import { useRouter } from 'next/dist/client/router';
import {GetServerSideProps} from 'next';
import assert from 'assert';
import { getUserFromHTTPRequest } from '../data/leader-shared';

type IProps = {}

const Page: NextPage<IProps> = () => {
  return (
    <div className='bg-adhdPurple min-h-screen text-adhdBlue'>
      <Head>
        <title>Update password - ADHD Together</title>
        <meta name="description" content="Session rooms for ADHD Together" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='max-w-5xl mx-auto p-5 space-y-4 py-7'>
        <header className='text-center'>
          <span className='inline-block'><Logo /></span>
        </header>
        <Auth view='update_password' redirectTo={'/'} />
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<IProps, {}> = async ({ req, params }) => {
  try {
    const { user } = await getUserFromHTTPRequest(req)
    assert(!!user, 'No user found in request')
    return { props: {} }
  } catch (e) {
    console.error(e)
    return { props: {}, redirect: { destination: '/user', permanent: false } }
  }
}

export default Page
