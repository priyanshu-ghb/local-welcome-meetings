import { Block, Page, PaginatedList } from '@notionhq/client/build/src/api-types'
import type { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'
import Image from 'next/image'
import { NotionTree } from '../components/Notion'
import { getRoomBySlug } from '../data/rooms'
import { getSlideContent, getSlides, RecursiveNotionBlock } from '../data/slideshow';
import styles from '../styles/Home.module.css'
import { Room } from '../types/supabase';

type IProps = {
  room?: Room | null
  slides?: Block[]
  currentSlideMetadata?: Block
  currentSlideIndex: number
  currentSlideTree?: RecursiveNotionBlock[]
}

type IQuery = {
  roomSlug: string
}

const Home: NextPage<IProps> = ({ room, currentSlideMetadata, currentSlideTree }) => {
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
        <div>
          <h3>{currentSlideMetadata.child_page.title}</h3>
          {currentSlideTree ? <NotionTree tree={currentSlideTree} /> : "No slide data"}
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<IProps, IQuery> = async ({ params }) => {
  const room = await getRoomBySlug(params!.roomSlug as string)
  if (!room) {
    return { props: {} }
  }
  const slides = await getSlides('Test slideshow') //room.slideshowName)
  const currentSlideIndex: number = room.currentSlideIndex || 0
  const currentSlideMetadata = slides[currentSlideIndex]
  const currentSlideTree = await getSlideContent(currentSlideMetadata.id)
  return { props: { room, slides, currentSlideIndex, currentSlideMetadata, currentSlideTree } }
}

export default Home