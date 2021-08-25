import { Page } from '@notionhq/client/build/src/api-types';
import type { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'
import { getRoomBySlug, RoomContextProvider } from '../../data/room';
import { getSlides } from '../../data/slideshow';
import { Room } from '../../types/app';
import Link from 'next/link';
import { Logo } from '../../components/Branding';
import { isClient } from '../../styles/screens';
import { getUserFromHTTPRequest } from '../../data/leader';
import { getUserProfileForEmail } from '../../data/auth';
import { strict as assert } from 'assert';

type IProps = {
  room: Room
}

type IQuery = {
  roomSlug: string
}

const Route: NextPage<IProps> = ({ room }) => {
  return (
    <RoomContextProvider slug={room.slug} initialData={{ room }}>
      <Head>
        <title>{room.name}</title>
        <meta name="description" content="Call link for ADHD Together." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='bg-white min-h-screen w-screen'>
        <main className='max-w-5xl mx-auto p-5 space-y-4 py-7'>
          <header className='text-center'>
            <span className='inline-block'><Logo /></span>
            <div>{room.name}</div>
          </header>
          <Link href={`/${room.slug}`} passHref>
            <div className='cursor-pointer text-xl font-semibold bg-green-100 hover:bg-green-200 transition active:bg-green-400 rounded-lg p-4 text-center border-2 border-green-400'>
              Go to meeting room &rarr;
            </div>
          </Link>
        </main>
      </div>
    </RoomContextProvider>
  )
}

export const getServerSideProps: GetServerSideProps<IProps, IQuery> = async ({ req, params }) => {
  try {
    const room = await getRoomBySlug(params!.roomSlug as string)
    assert(!!room, 'No room found for the slug')
    const { user } = await getUserFromHTTPRequest(req)
    assert(!!user, 'No user found in request')
    const profile = await getUserProfileForEmail(user.email!)
    assert(!!profile, 'No profile found for this user')
    return { props: { room } }
  } catch (e) {
    console.error(e)
    return { props: {}, redirect: { destination: '/', permanent: false } }
  }
}

export default Route