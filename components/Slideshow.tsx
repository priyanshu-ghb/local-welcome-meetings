import { Page } from '@notionhq/client/build/src/api-types';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { useRoom } from '../data/room';
import { markdownToHtml } from '../data/markdown';
import { useKeyPress, keyToCode } from '../utils/hooks';
import { Navigation } from './Elements';
import { useUser } from '../data/auth';
import { Disclosure } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/solid';
import cx from 'classnames';

export function Slideshow() {
  const { profile } = useUser()
  const { room, slides } = useRoom()

  const safeSlideIndex = useCallback((index: number) => {
    return Math.max(0, Math.min(slides.length - 1, index))
  }, [slides])

  const currentSlide = useMemo(() => {
    if (typeof room?.currentSlideIndex !== 'number') return null
    return slides[safeSlideIndex(room.currentSlideIndex)] as Page | null
  }, [slides, room?.currentSlideIndex, safeSlideIndex])

  return (
    <div className='prose'>
      <section className='p-4'>
        {/* @ts-ignore */}
        <h2 className='!mt-0'>{currentSlide?.properties["Name"].title!.map(fragment => fragment.plain_text).join()}</h2>
        {/* @ts-ignore */}
        {currentSlide?.properties["Member notes"].rich_text!.map((fragment, i) =>
          <div key={i} className={`dictates-colour ${convertNotionToTailwindColour(fragment.annotations.color)}`} dangerouslySetInnerHTML={{ __html: markdownToHtml(fragment.text.content) }} />
        )}
      </section>
      {profile?.canLeadSessions && <section className='dark-prose mx-4 text-adhdPurple'>
        <Disclosure>
          {({ open }) => <div className={cx(open ? 'opacity-100' : 'opacity-50', 'bg-white rounded-lg overflow-hidden')}>
            <Disclosure.Button className='flex flex-row justify-between items-center w-full hover:bg-yellow-200 transition rounded-lg p-4 py-3'>
              <span className='flex flex-row items-center'>
                <span className='uppercase text-sm font-semibold'>{open ? 'Close leader notes' : 'Show leader notes'}</span>
                <ChevronRightIcon
                  className={cx('inline-block w-[30px] h-[30px]', open ? "transform rotate-90" : "")}
                />
              </span>
            </Disclosure.Button>
            <Disclosure.Panel className='p-4 pt-0 pb-2'>
              {/* @ts-ignore */}
              {currentSlide?.properties["Speaker notes"].rich_text!.map((fragment, i) =>
                <div key={i} className={`dictates-colour ${convertNotionToTailwindColour(fragment.annotations.color)}`} dangerouslySetInnerHTML={{ __html: markdownToHtml(fragment.text.content) }} />
              )}
            </Disclosure.Panel>
          </div>}
        </Disclosure>
      </section>}
      <div className='pt-4' />
    </div>
  )
}

export const convertNotionToTailwindColour = (color: string) => {
  switch (color) {
    case "gray": return 'text-gray-400'
    case "brown": return 'text-yellow-600'
    case "orange": return 'text-yellow-500'
    case "yellow": return 'text-yellow-300'
    case "green": return 'text-green-500'
    case "blue": return 'text-blue-400'
    case "purple": return 'text-purple-400'
    case "pink": return 'text-pink-400'
    case "red": return 'text-red-400'
    case "gray_background": return 'bg-gray-300 text-gray-900 rounded-lg px-1'
    case "brown_background": return 'bg-yellow-900 text-yellow-100 rounded-lg px-1'
    case "orange_background": return 'bg-yellow-400 text-yellow-900 rounded-lg px-1'
    case "yellow_background": return 'bg-yellow-200 text-yellow-900 rounded-lg px-1'
    case "green_background": return 'bg-green-400 text-green-900 rounded-lg px-1'
    case "blue_background": return 'bg-blue-300 text-blue-900 rounded-lg px-1'
    case "purple_background": return 'bg-purple-300 text-purple-900 rounded-lg px-1'
    case "pink_background": return 'bg-pink-300 text-pink-900 rounded-lg px-1'
    case "red_background": return 'bg-red-300 text-red-900 rounded-lg px-1'
    case "default":
    default: return ''
  }
}

export function SlideshowControls() {
  const { profile } = useUser()
  const { room, updateRoom, slides } = useRoom()

  const safeSlideIndex = useCallback((index: number) => {
    return Math.max(0, Math.min(slides?.length - 1, index))
  }, [slides])

  const changeSlide = async (requestedIndex: number) => {
    const nextIndex = safeSlideIndex(requestedIndex)
    return updateRoom({ currentSlideIndex: nextIndex })
  }

  useKeyPress(keyToCode('left'), () => room && changeSlide(room.currentSlideIndex - 1))
  useKeyPress(keyToCode('right'), () => room && changeSlide(room.currentSlideIndex + 1))

  if (!room) return <div />

  return profile?.canLeadSessions ? <div>
    <Navigation
      clickPrevious={() => changeSlide(room.currentSlideIndex - 1)}
      clickNext={() => changeSlide(room.currentSlideIndex + 1)}
    >
      {room.currentSlideIndex + 1} of {slides?.length || 0}
    </Navigation>
  </div> : null
}