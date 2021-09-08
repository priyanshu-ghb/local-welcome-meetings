import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import { getAllRooms } from '../data/room';
import { Room, RoomPermissionType } from '../types/app';
import RoomList from '../components/Rooms';
import Auth from '../components/Auth';
import { useUser } from '../data/auth';
import { Header, Loading } from '../components/Layout';

type IProps = {
  rooms: Room[]
}

type IQuery = {}

const Home: NextPage<IProps> = ({ rooms }) => {
  const { user, profile, permissions } = useUser()

  return (
    <div className='bg-gray-100 min-h-screen w-screen'>
      <Head>
        <title>ADHD Together</title>
        <meta name="description" content="Session rooms for ADHD Together" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className='max-w-lg mx-auto py-5 relative space-y-5'>
        {!!user && !profile && <Loading />}
        <div>
          {!!profile && <RoomList key='rooms' rooms={rooms.filter(r => {
            return profile.canManageShifts || permissions.some(p => p.type === RoomPermissionType.Lead && p.roomId === r.id)
          })} />}
        </div>
        <Auth key='auth' />
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
