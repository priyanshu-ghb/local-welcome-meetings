import { Room } from '../types/app';
import Link from 'next/link';
import copy from 'copy-to-clipboard';
import { ClipboardCopyIcon, TrashIcon } from '@heroicons/react/outline'
import { RoomLink } from '../pages/[roomSlug]/manage';
import { CalendarIcon } from '@heroicons/react/outline';
import { useUser } from '../data/auth';
import { deleteRoom } from '../data/room';
import { MenuItem, DropdownMenu } from './Menu';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';

export default function RoomList({ rooms }: { rooms: Room[] }) {
  const { profile } = useUser()

  return (
    <section className="space-y-4 divide-y divide-gray-200">
      {rooms.map((room) => {
        const baseurl = process.env.NEXT_PUBLIC_BASEURL
        const path = `/${room.slug}`
        const url = baseurl+path
        return (
          <article key={room.id} className='w-full bg-white rounded-lg p-4 sm:p-5 transition text-sm space-y-4'>
            <h3 className=" text-gray-900 font-bold text-2xl">{room.name} group</h3>
            <RoomLink room={room} />
            <div className='flex flex-row space-x-2'>
              <Link href={`${path}/manage`} passHref>
                <button className='button'>
                  <CalendarIcon className="-ml-1 mr-1 h-4 w-4 text-gray-500" aria-hidden="true" />
                  <span>Leader scheduling</span>
                </button>
              </Link>
              {profile?.canManageShifts && <DropdownMenu title="Options" button={
                <Menu.Button className={'button'}>
                  <span>More Options</span>
                  <ChevronDownIcon
                    className="w-4 -mr-1 text-violet-200 hover:text-violet-100 inline"
                    aria-hidden="true"
                  />
                </Menu.Button>
              }>
                <MenuItem text="Copy URL" Icon={ClipboardCopyIcon} onClick={() => copy(url)} />
                <MenuItem text="Delete" Icon={TrashIcon} onClick={() => deleteRoom(room.id)} className='text-red-500' />
              </DropdownMenu>}
            </div>
          </article>
        )
      })}
    </section>
  )
}
