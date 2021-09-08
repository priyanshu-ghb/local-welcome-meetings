import { Room } from '../types/app';
import Link from 'next/link';
import copy from 'copy-to-clipboard';
import { ClipboardCopyIcon } from '@heroicons/react/solid'
import { RoomLink } from '../pages/[roomSlug]/manage';
import { CalendarIcon } from '@heroicons/react/outline';

export default function RoomList({ rooms }: { rooms: Room[] }) {
  return (
    <section className="space-y-4 divide-y divide-gray-200">
      {rooms.map((room) => {
        const baseurl = process.env.NEXT_PUBLIC_BASEURL
        const path = `/${room.slug}`
        const url = baseurl+path
        return (
          <article key={room.id} className='bg-white rounded-lg p-4 sm:p-5 transition text-sm space-y-4'>
            <h3 className=" text-gray-900 font-bold text-2xl">{room.name} group</h3>
            <RoomLink room={room} />
            <div className='flex flex-row space-x-2'>
              <Link href={`${path}/manage`} passHref>
                <button className='button'>
                  <CalendarIcon className="-ml-1 mr-2 h-4 w-4 text-gray-500" aria-hidden="true" />
                  Leader scheduling
                </button>
              </Link>
              <button
                data-attr='room-directory-copy-link'
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => copy(url)}
              >
                <ClipboardCopyIcon className="-ml-1 mr-2 h-4 w-4 text-gray-500" aria-hidden="true" />
                Copy room link
              </button>
            </div>
          </article>
        )
      })}
    </section>
  )
}
