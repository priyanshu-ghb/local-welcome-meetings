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
        <section className='relative md:col-span-2 bg-adhdDarkPurple h-[550px] max-h-[66vh] md:h-full md:max-h-full'>
          <VideoCall key={room.wherebyMeetingId} />
        </section>
        <section className='md:max-h-screen md:flex flex-col justify-start md:overflow-hidden border-l-2 border-l-adhdDarkPurple'>
          <div className='border-b-2 border-b-adhdDarkPurple'>
            <div className='p-4 flex flex-row items-center align-middle justify-around'>
              <div className='inline-block'>
                <Timer />
              </div>
              <header className='md:flex flex-col text-center'>
                <span className='mx-[-6px]'><Logo /></span>
                <h1 className='text-lg'>{room.name}</h1>
              </header>
            </div>
          </div>
          <section className='overflow-y-auto'>
            {profile?.canLeadSessions && (
              <div className='px-4 pt-4'>
                <SlideshowControls />
              </div>
            )}
            <Slideshow />
          </section>
        </section>
      </main>
    </>
  )
}