import { Page } from '@notionhq/client/build/src/api-types';
import type { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'
import { getRoomBySlug } from '../data/room'
import { getSlides } from '../data/slideshow';
import { Room } from '../types/app';
import { Slideshow, SlideshowControls } from '../components/Slideshow';
import { Timer } from '../components/Timer';
import { VideoCall } from '../components/VideoCall';
import { useUser } from '../data/auth';
import { Logo } from '../components/Branding';

type IProps = {
  room: Room | null
  slides: Page[] | null
}

type IQuery = {
  roomSlug: string
}

const Home: NextPage<IProps> = ({ room, slides }) => {
  const router = useRouter()
  const { roomSlug } = router.query
  const [user, isLoggedIn, profile] = useUser()

  if (!room) {
    return <div>No room found.</div>
  }

  return (
    <div>
      <Head>
        <title>{room?.name || roomSlug}</title>
        <meta name="description" content="Call link for ADHD Together." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='grid md:grid-cols-3 w-screen h-screen overflow-hidden bg-adhdPurple text-adhdBlue'>
        <section className='flex justify-center align-middle col-span-2 max-h-screen bg-adhdDarkPurple min-h-[55vh]'>
          <VideoCall room={room} />
        </section>
        <section className='max-h-screen flex flex-col justify-start overflow-hidden border-l-2 border-l-adhdDarkPurple'>
          <div className='border-b-2 border-b-adhdDarkPurple'>
            <div className='p-4 text-center flex flex-row items-center align-middle justify-around'>
              <div className='inline-block'>
                <Timer room={room} />
              </div>
              <header className='text-center flex flex-col justify-around items-center'>
                <Logo />
                <h1 className='text-2xl'>{room?.name ||`/${roomSlug}`}</h1>
                {slides && profile?.canLeadSessions && (
                  <div className='text-center py-2'>
                    <SlideshowControls slides={slides} room={room} />
                  </div>
                )}
              </header>
            </div>
          </div>
          {slides && (
            <section className='overflow-y-auto'>
              <Slideshow slides={slides} room={room} />
            </section>
          )}
        </section>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<IProps, IQuery> = async ({ params }) => {
  const room = await getRoomBySlug(params!.roomSlug as string)
  if (!room) return { props: { room: null, slides: null } }
  const slides = await getSlides(room.slideshowName)
  return { props: { room, slides } }
}

export default Home