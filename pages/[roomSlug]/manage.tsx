import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { getRoomBySlug, RoomContextProvider } from '../../data/room';
import { Room } from '../../types/app';
import Link from 'next/link';
import { getUserFromHTTPRequest } from '../../data/leader';
import { getUserProfile, useUser } from '../../data/auth';
import { strict as assert } from 'assert';
import { CreateShiftPattern, ShiftPatterns } from '../../components/ShiftPatterns';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Header } from '../../components/Layout';
import { RotaContextProvider } from '../../data/rota';

type IProps = {
  room: Room
}

type IQuery = {
  roomSlug: string
}

const Route: NextPage<IProps> = ({ room }) => {
  const { profile } = useUser()

  return (
    <RoomContextProvider slug={room.slug} initialData={{ room }}>
      <Head>
        <title>{room.name}</title>
        <meta name="description" content="Call link for ADHD Together." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='bg-white min-h-screen w-screen'>
        <Header isNarrow />
        <main className='max-w-lg mx-auto p-5 space-y-5 py-5'>
          <section>
            <h2 className='text-2xl font-bold text-adhdPurple mb-2'>Meeting room</h2>
            <RoomLink room={room} />
          </section>
          <section>
            <header className='mb-5'>
              <h2 className='text-2xl font-bold text-adhdPurple mb-2'>Rota</h2>
              <p>A rota of who will be hosting each session. We use this to send out confirmation emails to leaders and members.</p>
            </header>
            <RotaContextProvider>
              <ShiftPatterns />
              {profile?.canManageShifts && <CreateShiftPattern />}
            </RotaContextProvider>
          </section>
        </main>
      </div>
    </RoomContextProvider>
  )
}

export function RoomLink ({ room }: { room: Room }) {
  return <Link href={`/${room.slug}`} passHref>
    <div className='flex flex-row justify-between text-adhdBlue cursor-pointer bg-adhdPurple hover:bg-adhdDarkPurple transition rounded-lg p-3'>
      <div>
        <div className='text-lg font-semibold'>ADHD Together {room.name}</div>
        <div className='underline opacity-80 text-sm'>session.adhdtogether.org.uk/{room.slug}</div>
      </div>
      <ExternalLinkIcon className='w-5 h-5' />
    </div>
  </Link>
}

export const getServerSideProps: GetServerSideProps<IProps, IQuery> = async ({ req, params }) => {
  try {
    const room = await getRoomBySlug(params!.roomSlug as string)
    assert(!!room, 'No room found for the slug')
    const { user } = await getUserFromHTTPRequest(req)
    assert(!!user, 'No user found in request')
    const profile = await getUserProfile(user.id)
    assert(!!profile?.canLeadSessions, 'User is not a leader')
    return { props: { room } }
  } catch (e) {
    console.error(e)
    return { props: {}, redirect: { destination: '/user', permanent: false } }
  }
}

export default Route