import { Logo } from './Branding';
import { useUser } from '../data/auth';
import { useRoom } from '../data/room';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid'
import { LogoutIcon, PencilIcon } from '@heroicons/react/outline'

export function Header() {
  const { room } = useRoom()
  const { isLoggedIn, signOut, signIn } = useUser()
  const router = useRouter()

  return (
    <header className='bg-adhdPurple p-3 sm:p-4 text-adhdBlue'>
      <div className={`flex flex-row justify-between items-center max-w-5xl mx-auto`}>
        <Link href='/'>
          <span className='inline-block cursor-pointer'><Logo /></span>
        </Link>
        <div className='space-x-4 text-right'>
          {room && <span className='font-semibold text-lg'>{room.name}</span>}
          {isLoggedIn && (
            <Menu as="div" className="whitespace-nowrap relative inline-block text-left">{({ open }) => (
              <Fragment>
                <div>
                  <Menu.Button className='cursor-pointer opacity-80 bg-adhdDarkPurple rounded-lg p-2'>
                    <span>Settings</span>
                    <ChevronDownIcon
                      className="w-4 -mr-1 text-violet-200 hover:text-violet-100 inline"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Menu.Items className="min-w-[200px] text-black z-50 absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1 ">
                      <Menu.Item>
                        {({ active }) => (
                          <span 
                          className={`${
                            active ? 'bg-adhdPurple text-white' : 'text-gray-900'
                          } group flex rounded-md cursor-pointer items-center w-full px-2 py-2 text-sm`} onClick={() => signOut(false)}>
                            <LogoutIcon className='w-4 mr-2' />
                            Sign out
                          </span>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <MenuLink href='/update-password'><span 
                          className={`${
                            active ? 'bg-adhdPurple text-white' : 'text-gray-900'
                          }  group flex rounded-md cursor-pointer items-center w-full px-2 py-2 text-sm`}>
                            <PencilIcon className='w-4 mr-2' />
                            Change password
                          </span></MenuLink>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Fragment>
            )}</Menu>
          )}
          <Link href='/our-courses'>
            <span className='cursor-pointer opacity-80  p-2'>Our Courses</span>
          </Link>
          <Link href='/pricing'>
            <span className='cursor-pointer opacity-80  p-2'>Pricing</span>
          </Link>
          {!isLoggedIn && <span className='cursor-pointer opacity-80 bg-adhdDarkPurple rounded-lg p-2' onClick={signIn}>Sign in</span>}
        </div>
      </div>
    </header>
  )
}

export function Loading() {
  return <div className='flex flex-col justify-content items-center align-middle content-center text-center w-full absolute top-0 left-0 h-full'>
    <div className='text-lg font-semibold'>Loading...</div>
  </div>
}

export function MenuLink(props: any) {
  let { href, children, ...rest } = props
  return (
    <Link href={href}>
      <a {...rest}>{children}</a>
    </Link>
  )
}