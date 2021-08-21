import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import { getAllRooms } from '../data/room';
import styles from '../styles/Home.module.css'
import { Room } from '../types/supabase-local';
import Link from 'next/link'

type IProps = {
  rooms: Room[]
}

type IQuery = {}

const Home: NextPage<IProps> = ({ rooms }) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>ADHD Together</title>
        <meta name="description" content="Session rooms for ADHD Together" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to ADHD Together session
        </h1>

        <div>
          {rooms.map(room => (
            <Link key={room.id} href={`/${room.slug}`}>
              <div>
                {room.name}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<IProps, IQuery> = async (context) => {
  return {
    props: {
      rooms: await getAllRooms()
    }
  }
}

export default Home
