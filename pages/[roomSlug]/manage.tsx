import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { getRoomBySlug, RoomContextProvider } from '../../data/room';
import { Room } from '../../types/app';
import Link from 'next/link';
import { getUserProfile, useUser } from '../../data/auth';
import { strict as assert } from 'assert';
import { CreateShiftPattern, ShiftPatterns } from '../../components/ShiftPatterns';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Header } from '../../components/Layout';
import { RotaContextProvider, useRota } from '../../data/rota';
import { ShiftSchedule, SubscribeToCalendarDialog } from '../../components/ShiftSchedule';
import { Disclosure, Tab } from '@headlessui/react'
import { getUserFromHTTPRequest } from '../../data/leader-shared';
import { CalendarIcon } from '@heroicons/react/outline';
import { useState } from 'react';

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
      <div className='bg-gray-100 min-h-screen w-screen'>
        <Header />
        <main className='max-w-lg mx-auto p-4 sm:p-5 space-y-5 py-5'>
          <section>
            <h2 className='text-sm font-bold text-adhdPurple mb-2 uppercase'>
              Meeting room
            </h2>
            <RoomLink room={room} />
          </section>
          <section>
            <h2 className='text-sm font-bold text-adhdPurple mb-2 uppercase'>
              Your calendar
            </h2>
            <Disclosure>
              {({ open, close }) => <>
                <Disclosure.Button as='button' className="button">
                  Subscribe to calendar <CalendarIcon className='w-4 h-4 ml-1' />
                </Disclosure.Button>
                <Disclosure.Panel>
                  <SubscribeToCalendarDialog open={open} onClose={() => close()} />
                </Disclosure.Panel>
              </>}
            </Disclosure>
          </section>
          <section>
            <RotaContextProvider>
              <ShiftManager />
            </RotaContextProvider>
          </section>
        </main>
      </div>
    </RoomContextProvider>
  )
}

function ShiftManager () {
  const rota = useRota()
  const { profile } = useUser()

  return !rota.roomLeaders.length ? (
    <div>Loading rota...</div>
  ) : (
    <Tab.Group>
      <Tab.List className='w-full flex justify-evenly border-b-2 border-gray-200'>
        <Tab className={({ selected }) => `uppercase text-sm font-bold py-2 px-4 w-full box-content border-b-2 ${selected ? 'border-adhdPurple text-adhdPurple' : 'text-gray-500 border-transparent'}`}>
          Rota
        </Tab>
        <Tab className={({ selected }) => `uppercase text-sm font-bold py-2 px-4 w-full box-content border-b-2 ${selected ? 'border-adhdPurple text-adhdPurple' : 'text-gray-500 border-transparent'}`}>
          Calendar
        </Tab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel className='space-y-5 py-5'>
          <ShiftPatterns />
          {profile?.canManageShifts && <CreateShiftPattern />}
        </Tab.Panel>
        <Tab.Panel className='space-y-5 py-5'>
          <ShiftSchedule />
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
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