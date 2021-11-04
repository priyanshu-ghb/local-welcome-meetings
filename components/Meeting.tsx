import { Slideshow, SlideshowControls } from '../components/Slideshow';
import { Timer } from '../components/Timer';
import { VideoCall } from '../components/VideoCall';
import { Logo } from '../components/Branding';
import { useUser } from '../data/auth';
import { useRoom } from '../data/room';
import Link from 'next/link';
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorModal } from './ErrorModal';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { LogoutIcon, PencilIcon, CogIcon, LoginIcon } from '@heroicons/react/outline';

export const Meeting = () => {
  const { profile, isLoggedIn } = useUser()
  const { room } = useRoom()

  if (!room) return <div>Loading room...</div>

  return (
    <>
      <main className='md:grid md:grid-cols-3 w-screen md:h-screen md:overflow-hidden bg-adhdPurple text-adhdBlue'>
        <ErrorBoundary fallbackRender={() => <div />}>
          <section className='relative md:col-span-2 bg-adhdDarkPurple h-[550px] max-h-[66vh] md:h-full md:max-h-full'>
            <VideoCall key={room.wherebyMeetingId} />
          </section>
        </ErrorBoundary>
        <ErrorBoundary fallbackRender={() => <div />}>
        <section className='md:max-h-screen md:flex flex-col justify-start md:overflow-hidden border-l-2 border-l-adhdDarkPurple'>
          <div className='border-b-2 border-b-adhdDarkPurple'>
            <div className='p-3 lg:p-4 flex flex-row items-center align-middle justify-around'>
              <div className='inline-block relative'>
                <Timer />
              </div>
              <header className='md:flex flex-col'>
                <span className='mx-[-6px]'><Logo /></span>
                <h1 className='text-lg'>{room.name}</h1>
              </header>
            </div>
          </div>
          <ErrorBoundary fallbackRender={() => <div />}>
            <section className='overflow-y-auto'>
              <div key='controls' className={`flex flex-row justify-between p-4 space-x-2 border-b-2 border-b-adhdDarkPurple text-center ${!profile?.canLeadSessions && 'hidden'}`}>
                <SlideshowControls />
                <RoomOptions />
              </div>
              <div key='slideshow'>
                <Slideshow />
              </div>
            </section>
          </ErrorBoundary>
        </section>
        </ErrorBoundary>
      </main>
    </>
  )
}

function RoomOptions () {
  const { profile, isLoggedIn, signOut } = useUser()
  const { room } = useRoom()

  return <Menu as="div" className="relative inline-block text-left">{({ open }) => (
    <Fragment>
      <div>
        <Menu.Button className='whitespace-nowrap cursor-pointer opacity-80 bg-adhdDarkPurple rounded-lg p-2 py-1'>
          <span>Settings</span>
          <ChevronDownIcon
            className="w-4 -mr-1 text-violet-200 hover:text-violet-100 inline"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Menu.Items className="min-w-[200px] text-black z-50 absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1 ">
            {/* {profile?.canLeadSessions && (
              <Menu.Item>
                {({ active }) => (
                  <span 
                  className={`${active ? 'bg-adhdPurple text-white' : 'text-gray-900'} group flex rounded-md cursor-pointer items-center w-full px-2 py-2 text-sm`}>
                    <CogIcon className='w-4 mr-2' />
                    Change slideshow
                  </span>
                )}
              </Menu.Item>
            )} */}
            {isLoggedIn ? <Fragment>
              <Menu.Item>
                {({ active }) => (
                  <span 
                  className={`${active ? 'bg-adhdPurple text-white' : 'text-gray-900'} group flex rounded-md cursor-pointer items-center w-full px-2 py-2 text-sm`} onClick={signOut}>
                    <LogoutIcon className='w-4 mr-2' />
                    Sign out
                  </span>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link href='/update-password' passHref><span 
                  className={`${active ? 'bg-adhdPurple text-white' : 'text-gray-900'}  group flex rounded-md cursor-pointer items-center w-full px-2 py-2 text-sm`}>
                    <PencilIcon className='w-4 mr-2' />
                    Change password
                  </span></Link>
                )}
              </Menu.Item>
            </Fragment> : (
              <Menu.Item>
                {({ active }) => (
                  <Link href='/user' passHref>
                    <span 
                      className={`${active ? 'bg-adhdPurple text-white' : 'text-gray-900'} group flex rounded-md cursor-pointer items-center w-full px-2 py-2 text-sm`}>
                      <LoginIcon className='w-4 mr-2' />
                      Sign in
                    </span>
                  </Link>
                )}
              </Menu.Item>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Fragment>
  )}</Menu>
}