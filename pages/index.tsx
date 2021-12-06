import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import { getAllRooms, useRooms } from '../data/room';
import { Room, RoomPermissionType } from '../types/app';
import RoomList from '../components/Rooms';
import Auth from '../components/Auth';
import { useUser } from '../data/auth';
import { Header, Loading } from '../components/Layout';
import { Fragment, useState } from 'react';
import CreateRoomModal from '../components/CreateRoom';
import Link from 'next/link';

type IProps = {
  rooms: Room[]
}

type IQuery = {}

const Home: NextPage<IProps> = ({ rooms }) => {
  const { user, isLoggedIn, profile, permissions, signIn } = useUser()
  const [roomOpen, setRoomOpen] = useState(false)
  const _rooms = useRooms(rooms)

  return (
    <div className='bg-gray-100 min-h-screen w-screen'>
      <Head>
        <title>ADHD Together</title>
        <meta name="description" content="Session rooms for ADHD Together" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className=''>
      <div className="pt-6 pb-6 flex items-center	content-center height-vh-without-header hero-section relative bg-center	bg-no-repeat bg-cover" style={{ backgroundImage:'url(https://images.pexels.com/photos/8378728/pexels-photo-8378728.jpeg?cs=srgb&dl=pexels-tara-winstead-8378728.jpg&fm=jpg)' }}>
            <div className="max-w-5xl mx-auto ">
                <div className="text-center">
                    <div className="">
                        <h1 className="mb-4 text-6xl font-bold">Donec hendrerit nunc et porttitor tincidunt.</h1>
                            <div className="mb-4">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod, voluptas inventore vel repudiandae quam nesciunt officia, rerum officiis eligendi sint dolorum nemo saepe porro laboriosam vero molestias error, omnis nostrum. 
                            </div>
                            <div className="btn-wrapper">
                              <a className="button m-1" target="_blank" href="https://brandonjackson.typeform.com/to/JFz8XJjf?typeform-source=www.google.com" rel="noopener noreferrer">
                                      Register Interest
                              </a>
                              {!!user && !profile && <Loading />}
                              {isLoggedIn && profile?.canManageShifts && <Fragment>
                                <button className='button' onClick={() => setRoomOpen(true)}>Create room</button>
                                <CreateRoomModal isOpen={roomOpen} setIsOpen={setRoomOpen} />
                              </Fragment>}
                              {!!(isLoggedIn && !!profile) && <RoomList key='rooms' rooms={_rooms?.filter(r => {
                                return profile?.canManageShifts || permissions?.some(p => p.type === RoomPermissionType.Lead && p.roomId === r.id)
                              })} />}
                              {!isLoggedIn && <button onClick={signIn} className='button m-1'>
                                Sign in to manage rooms
                              </button>}
                            </div>
                    </div>
                    
                </div>
            </div>
        </div>
        
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
