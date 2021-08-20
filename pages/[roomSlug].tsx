import type { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'
import Image from 'next/image'
import { getRoomBySlug } from '../data/rooms'
import styles from '../styles/Home.module.css'
import { Room } from '../types/supabase';

type IProps = {
  room: Room | null
}

type IQuery = {
  roomSlug: string
}

const Home: NextPage<IProps> = ({ room }) => {
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
        <h1 className={styles.title}>
          Welcome to {room?.name ||`/${roomSlug}`}
        </h1>
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
  return { props: { room } }
}

export default Home