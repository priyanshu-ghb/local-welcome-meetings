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
  const [user, isLoggedIn] = useUser()

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

      <main className='grid md:grid-cols-3 w-screen h-screen overflow-hidden'>
        <section className='flex justify-center align-middle col-span-2 max-h-screen'>
          <VideoCall room={room} />
        </section>
        <section className='max-h-screen flex flex-col justify-start overflow-hidden'>
          <header className='p-4 text-center'>
            <h1 className='text-2xl'>{room?.name ||`/${roomSlug}`}</h1>
            <h2 className='text-base text-gray-400'>ADHD Together session</h2>
          </header>
          <div className='p-4 text-center pb-4 border-b border-b-gray-400'>
            <span className='inline-block'>
              <Timer room={room} />
            </span>
            {slides && isLoggedIn && (
              <SlideshowControls slides={slides} room={room} />
            )}
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