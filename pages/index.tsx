import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import { getAllRooms } from '../data/room';
import { Room } from '../types/app';
import RoomList from '../components/Rooms';
import Auth from '../components/Auth';
import { Logo } from '../components/Branding';
import { useUser } from '../data/auth';
import { Debug } from '../components/Elements';

type IProps = {
  rooms: Room[]
}

type IQuery = {}

const Home: NextPage<IProps> = ({ rooms }) => {
  const { profile } = useUser()

  return (
    <div className='bg-adhdPurple min-h-screen text-adhdBlue'>
      <Head>
        <title>ADHD Together</title>
        <meta name="description" content="Session rooms for ADHD Together" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='max-w-5xl mx-auto p-5 space-y-4 py-7'>
        <header className='text-center'>
          <span className='inline-block'><Logo /></span>
        </header>
        {profile?.canLeadSessions && (
          <>
            <h2 className='text-xl font-semibold'>Sessions</h2>
            <RoomList rooms={rooms} />
          </>
        )}
        <h2 className='text-xl font-semibold'>Leaders</h2>
        <Auth />
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<IProps, IQuery> = async (context) => {
  return {
    props: {
      rooms: await getAllRooms()
    }
  }
}

export default Home
