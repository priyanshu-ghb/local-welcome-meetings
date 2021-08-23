import { Page } from '@notionhq/client/build/src/api-types';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import { useRoom } from '../data/room';
import { Room } from '../types/app';
import { markdownToHtml } from '../data/markdown';
import { useKeyPress, keyToCode } from '../utils/hooks';
import { Navigation } from './Elements';
import { useUser } from '../data/auth';

export function Slideshow({ slides, room: _room }: {
  slides: Page[],
  room: Room
}) {
  const { profile } = useUser()
  const [room, updateRoom] = useRoom(_room.slug, _room)

  const safeSlideIndex = useCallback((index: number) => {
    return Math.max(0, Math.min(slides.length - 1, index))
  }, [slides])

  const currentSlide = useMemo(() => {
    return slides[safeSlideIndex(room.currentSlideIndex)] as Page | null
  }, [slides, room.currentSlideIndex, safeSlideIndex])

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
      {profile?.canLeadSessions && <section className='dark-prose rounded-lg p-4 mx-4 bg-white text-adhdPurple'>
        <h4 className='!mt-0 uppercase text-sm font-semibold'>Leader notes</h4>
        {/* @ts-ignore */}
        {currentSlide?.properties["Speaker notes"].rich_text!.map((fragment, i) =>
          <div key={i} className={`dictates-colour ${convertNotionToTailwindColour(fragment.annotations.color)}`} dangerouslySetInnerHTML={{ __html: markdownToHtml(fragment.text.content) }} />
        )}
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

export function SlideshowControls({ slides, room: _room }: {
  slides: Page[],
  room: Room
}) {
  const { profile } = useUser()
  const [room, updateRoom] = useRoom(_room.slug, _room)

  const safeSlideIndex = useCallback((index: number) => {
    return Math.max(0, Math.min(slides.length - 1, index))
  }, [slides])

  const changeSlide = async (requestedIndex: number) => {
    const nextIndex = safeSlideIndex(requestedIndex)
    return await updateRoom({ currentSlideIndex: nextIndex })
  }

  useKeyPress(keyToCode('left'), () => changeSlide(room.currentSlideIndex - 1))
  useKeyPress(keyToCode('right'), () => changeSlide(room.currentSlideIndex + 1))

  return profile?.canLeadSessions ? <div>
    <Navigation
      clickPrevious={() => changeSlide(room.currentSlideIndex - 1)}
      clickNext={() => changeSlide(room.currentSlideIndex + 1)}
    >
      {room.currentSlideIndex + 1} of {slides?.length || 0}
    </Navigation>
  </div> : null
}