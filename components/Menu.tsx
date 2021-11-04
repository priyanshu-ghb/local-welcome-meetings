import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';

export function DropdownMenu ({ button, title, children }: { button?: any, title?: string, children: any }) {
  return <Menu as="div" className="whitespace-nowrap relative inline-block text-left">{({ open }) => (
    <Fragment>
      <div>
        {button || 
          <Menu.Button className={'cursor-pointer opacity-80 bg-adhdDarkPurple rounded-lg p-2'}>
            <span>{title}</span>
            <ChevronDownIcon
              className="w-4 -mr-1 text-violet-200 hover:text-violet-100 inline"
              aria-hidden="true"
            />
          </Menu.Button>
        }
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
            {children}
          </div>
        </Menu.Items>
      </Transition>
    </Fragment>
  )}</Menu>
}

export function MenuItem ({ text, Icon, onClick, className }: { text: string, Icon?: any, onClick: any, className?: string }) {
  return <Menu.Item>
    {({ active }) => (
      <span 
      className={`${
        active ? 'bg-adhdPurple text-white' : 'text-gray-900'
      } group flex rounded-md cursor-pointer items-center w-full px-2 py-2 text-sm ${className}`} onClick={onClick}>
        {Icon && <Icon className='w-4 mr-2' />}
        {text}
      </span>
    )}
  </Menu.Item>
}