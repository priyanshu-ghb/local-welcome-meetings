import { Block, Page, PaginatedList } from '@notionhq/client/build/src/api-types'
import type { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'
import Image from 'next/image'
import { NotionTree } from '../components/Notion'
import { getRoomBySlug } from '../data/rooms'
import { getChildPagesMetadataForPageId, getSlideContent, getSlides, RecursiveNotionBlock } from '../data/slideshow';
import styles from '../styles/Home.module.css'
import { Room } from '../types/supabase';

type IProps = {
  room?: Room | null
  slides: Block[] | null
  currentSlideIndex: number
  // currentSlideTree?: RecursiveNotionBlock[]
}

type IQuery = {
  roomSlug: string
}

const Home: NextPage<IProps> = ({ room, slides, currentSlideIndex }) => {
  const router = useRouter()
  const { roomSlug } = router.query

  if (!room) {
    return <div>No room found.</div>
  }

  const currentSlide = slides?.[currentSlideIndex]

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
        <Slideshow slides={slides} roomId={room.id} />
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<IProps, IQuery> = async ({ params }) => {
  const room = await getRoomBySlug(params!.roomSlug as string)
  if (!room) {
    return { props: {} }
  }
  const slides = await getSlides(room.slideshowName)
  const currentSlideIndex: number = room.currentSlideIndex || 0
  // console.log(room.slideshowName, slides, currentSlideIndex)
  // const currentSlideMetadata = slides[currentSlideIndex]
  // const currentSlideTree = await getSlideContent(currentSlideMetadata.id)
  return { props: { room, currentSlideIndex, slides } }
}

export default Home