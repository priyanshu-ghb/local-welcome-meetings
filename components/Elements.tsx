import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid"

export const Navigation = ({ clickPrevious, clickNext, children }: {
  clickPrevious: () => void,
  clickNext: () => void,
  children?: any
}) => (
  <nav className="group p-[0.5px] rounded-lg inline-flex bg-gray-100 hover:bg-gray-200 relative z-0 shadow-sm -space-x-px align-middle justify-center" aria-label="Pagination">
    <span
      onClick={clickPrevious}
      className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-md border-2 border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
    >
      <span className="sr-only">Previous</span>
      <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
    </span>
    <span className='px-2 flex justify-center align-middle flex-col text-sm'>{children}</span>
    <span
      onClick={clickNext}
      className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-md border-2 border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
    >
      <span className="sr-only">Next</span>
      <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
    </span>
  </nav>
)