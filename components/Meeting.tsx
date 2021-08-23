import { Slideshow, SlideshowControls } from '../components/Slideshow';
import { Timer } from '../components/Timer';
import { VideoCall } from '../components/VideoCall';
import { Logo } from '../components/Branding';
import { useUser } from '../data/auth';
import { useRoom } from '../data/room';

export const Meeting = (props: any) => {
  const { profile } = useUser()
  const { room } = useRoom()

  if (!room) return <div>Loading room...</div>

  return (
    <>
      <main className='md:grid md:grid-cols-3 w-screen md:h-screen md:overflow-hidden bg-adhdPurple text-adhdBlue'>
        <section className='flex justify-center items-center relative md:col-span-2 bg-adhdDarkPurple min-h-[55vh]'>
          <VideoCall />
        </section>
        <section className='max-h-screen md:flex flex-col justify-start md:overflow-hidden border-l-2 border-l-adhdDarkPurple'>
          <div className='border-b-2 border-b-adhdDarkPurple'>
            <div className='p-4 text-center flex flex-row items-center align-middle justify-around'>
              <div className='inline-block'>
                <Timer />
              </div>
              <header className='text-center md:flex flex-col justify-around items-center'>
                <Logo />
                <h1 className='text-2xl'>{room.name}</h1>
                {profile?.canLeadSessions && (
                  <div className='text-center py-2'>
                    <SlideshowControls />
                  </div>
                )}
              </header>
            </div>
          </div>
          <section className='overflow-y-auto'>
            <Slideshow />
          </section>
        </section>
      </main>
    </>
  )
}