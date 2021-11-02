import { Slideshow, SlideshowControls } from '../components/Slideshow';
import { Timer } from '../components/Timer';
import { VideoCall } from '../components/VideoCall';
import { Logo } from '../components/Branding';
import { useUser } from '../data/auth';
import { useRoom } from '../data/room';
import Link from 'next/link';
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorModal } from './ErrorModal';

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
                {!isLoggedIn && <div className='mt-2'>
                  <Link href='/user' passHref>
                    <span className='text-sm font-semibold cursor-pointer hover:bg-red-800 bg-adhdDarkPurple px-2 py-1 rounded-lg'>Leader sign in</span>
                  </Link>
                </div>}
              </header>
            </div>
          </div>
          <ErrorBoundary fallbackRender={() => <div />}>
            <section className='overflow-y-auto'>
              <div key='controls' className={`p-4 border-b-2 border-b-adhdDarkPurple ${!profile?.canLeadSessions && 'hidden'}`}>
                <SlideshowControls />
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