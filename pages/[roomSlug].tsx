import { Page } from '@notionhq/client/build/src/api-types';
import type { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'
import { getRoomBySlug } from '../data/room'
import { getSlides } from '../data/slideshow';
import styles from '../styles/Home.module.css'
import { Room } from '../types/supabase-local';
import { Slideshow } from '../components/Slideshow';

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

  if (!room) {
    return <div>No room found.</div>
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{room?.name || roomSlug}</title>
        <meta name="description" content="Call link for ADHD Together." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>
          Welcome to {room?.name ||`/${roomSlug}`}
        </h1>
        {slides && <Slideshow slides={slides} room={room} />}
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