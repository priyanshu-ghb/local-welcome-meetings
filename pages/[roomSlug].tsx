import { Page } from '@notionhq/client/build/src/api-types';
import type { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'
import { getRoomBySlug, RoomContextProvider } from '../data/room';
import { getSlides } from '../data/slideshow';
import { Room } from '../types/app';
import { Meeting } from '../components/Meeting';

type IProps = {
  room: Room | null
  slides: Page[]
}

type IQuery = {
  roomSlug: string
}

const Home: NextPage<IProps> = ({ room, slides }) => {
  const router = useRouter()

  if (!room) {
    router.push('/')
    return <div />
  }

  return (
    <RoomContextProvider slug={room.slug} initialData={{ room, slides }}>
      <Head>
        <title>{room.name}</title>
        <meta name="description" content="Call link for ADHD Together." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Meeting />
    </RoomContextProvider>
  )
}

export const getServerSideProps: GetServerSideProps<IProps, IQuery> = async ({ params }) => {
  const room = await getRoomBySlug(params!.roomSlug as string)
  if (!room) return { props: { room: null, slides: [] } }
  const slides = await getSlides(room.slideshowName)
  return { props: { room, slides: slides || [] } }
}

export default Home