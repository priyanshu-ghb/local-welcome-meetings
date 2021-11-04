import useSWR from 'swr';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, Suspense } from 'react';
import { SelectOption } from '@notionhq/client/build/src/api-types';
import { CheckIcon } from '@heroicons/react/outline';

export function SlideshowOptions ({
  menuButton, selectOption, currentOption }: {
  menuButton: any, selectOption: (option: SelectOption) => void, currentOption?: string
}) {
  return (
    <Menu as="div" className="w-full relative inline-block text-left">{({ open }) => (
      <Fragment>
        <div>
          {menuButton}
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
            <Suspense fallback={
              <Menu.Item>
                <span
                  className={`text-gray-900 group flex rounded-md cursor-pointer items-center w-full px-2 py-2 text-sm`} onClick={() => signOut(false)}>
                  Loading options...
                </span>
              </Menu.Item>
            }>
              <SlideshowMenuItems {... { currentOption, selectOption }} />
            </Suspense>
            </div>
          </Menu.Items>
        </Transition>
      </Fragment>
    )}</Menu>
  )
}

function SlideshowMenuItems ({
  selectOption, currentOption }: {
  selectOption: (option: SelectOption) => void, currentOption?: string
}) {
  const slideshowOptions = useSWR(`/api/slideshowOptions`, { suspense: true })

  return <Fragment>
    {slideshowOptions.data?.slideshowOptions.map((option: any) => (
      <Menu.Item key={option.id} onClick={() => selectOption(option)}>
        {({ active }) => (
          <span className={`${active ? 'bg-adhdPurple text-white' : 'text-gray-900'} group flex rounded-md cursor-pointer items-center w-full px-2 py-2 text-sm`}>
            {option.name === currentOption && <CheckIcon className='w-4 mr-2 flex-shrink-0' />}
            {option.name}
          </span>
        )}
      </Menu.Item>
    ))}
  </Fragment>
}