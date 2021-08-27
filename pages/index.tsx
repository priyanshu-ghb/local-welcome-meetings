import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import { getAllRooms } from '../data/room';
import { Room } from '../types/app';
import RoomList from '../components/Rooms';
import Auth from '../components/Auth';
import { Logo } from '../components/Branding';
import { useUser } from '../data/auth';
import { Header } from '../components/Layout';

type IProps = {
  rooms: Room[]
}

type IQuery = {}

const Home: NextPage<IProps> = ({ rooms }) => {
  const { profile } = useUser()

  return (
    <div className='bg-white min-h-screen text-adhdBlue'>
      <Head>
        <title>ADHD Together</title>
        <meta name="description" content="Session rooms for ADHD Together" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className='max-w-3xl mx-auto py-5'>
        {profile?.canLeadSessions && <RoomList rooms={rooms} />}
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
