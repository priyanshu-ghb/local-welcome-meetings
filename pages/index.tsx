import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import { getAllRooms } from '../data/room';
import { Room, RoomPermissionType } from '../types/app';
import RoomList from '../components/Rooms';
import Auth from '../components/Auth';
import { useUser } from '../data/auth';
import { Header } from '../components/Layout';

type IProps = {
  rooms: Room[]
}

type IQuery = {}

const Home: NextPage<IProps> = ({ rooms }) => {
  const { profile, permissions } = useUser()

  return (
    <div className='bg-gray-100 min-h-screen w-screen'>
      <Head>
        <title>ADHD Together</title>
        <meta name="description" content="Session rooms for ADHD Together" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className='max-w-lg mx-auto py-5'>
        {!profile && <Auth key='auth' />}
        {profile && <RoomList key='rooms' rooms={rooms.filter(r => {
          return profile.canManageShifts || permissions.some(p => p.type === RoomPermissionType.Lead && p.roomId === r.id)
        })} />}
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
