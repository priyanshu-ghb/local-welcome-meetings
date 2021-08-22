import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid"
import { useTime } from '../utils/hooks';
import { Transition } from '@headlessui/react';
import { differenceInSeconds, addSeconds } from 'date-fns';
import { useState } from 'react';

export const Navigation = ({ clickPrevious, clickNext, children }: {
  clickPrevious: () => void,
  clickNext: () => void,
  children?: any
}) => (
  <nav className="text-black group p-[0.5px] rounded-lg inline-flex bg-gray-200 relative z-0 shadow-sm -space-x-px align-middle justify-center" aria-label="Pagination">
    <span
      onClick={clickPrevious}
      className="cursor-pointer relative inline-flex items-center px-2 py-1 rounded-md text-sm font-medium text-gray-500"
    >
      <span className="sr-only">Previous</span>
      <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
    </span>
    <span className='px-2 flex justify-center align-middle flex-col text-sm font-semibold bg-white rounded-lg'>{children}</span>
    <span
      onClick={clickNext}
      className="cursor-pointer relative inline-flex items-center px-2 py-1 rounded-md text-sm font-medium text-gray-500"
    >
      <span className="sr-only">Next</span>
      <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
    </span>
  </nav>
)

export const Debug = (o: any) => <pre>{JSON.stringify(o, null, 2)}</pre>

export const ShowFor = ({ seconds, children }: { seconds: number, children: any }) => {
  const [startTime, setStartTime] = useState(new Date())
  const endTime = addSeconds(startTime, seconds)
  const time = useTime()

  return (
    <Transition
      appear={true}
      show={time < endTime}
      enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      {children}
    </Transition>
  )
}