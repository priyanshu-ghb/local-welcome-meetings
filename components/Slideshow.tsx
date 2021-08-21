import { Page } from '@notionhq/client/build/src/api-types';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { subscribeToRoomBySlug, updateRoom } from '../data/room';
import { Room } from '../types/app';
import { markdownToHtml } from '../data/markdown';
import { useKeyPress, keyToCode } from '../utils/hooks';
import { Navigation } from './Elements';
import { useUser } from '../data/auth';

export function Slideshow({ slides, room }: {
  slides: Page[],
  room: Room
}) {
  const [user, isLoggedIn] = useUser()
  const [currentSlideIndex, setCurrentSlideIndex] = useState(room.currentSlideIndex)

  useEffect(function listenForRoomChanges() {
    const unsubscribe = subscribeToRoomBySlug(room.slug, function onChange(payload) {
      console.log({ payload })
      if (payload.eventType !== 'UPDATE') return
      setCurrentSlideIndex(payload.new.currentSlideIndex || 0)
    })
    return () => void unsubscribe()
  }, [room.slug])

  const safeSlideIndex = useCallback((index: number) => {
    return Math.max(0, Math.min(slides.length - 1, index))
  }, [slides])

  const currentSlide = useMemo(() => {
    return slides[safeSlideIndex(currentSlideIndex)]
  }, [slides, currentSlideIndex, safeSlideIndex])

  const changeSlide = async (requestedIndex: number) => {
    const nextIndex = safeSlideIndex(requestedIndex)
    return await updateRoom(room.slug, { currentSlideIndex: nextIndex })
  }

  useKeyPress(keyToCode('left'), () => changeSlide(currentSlideIndex - 1))
  useKeyPress(keyToCode('right'), () => changeSlide(currentSlideIndex + 1))

  return (
    <div className='flex flex-col justify-start h-full'>
      {isLoggedIn && <div>
        <Navigation
          clickPrevious={() => changeSlide(currentSlideIndex - 1)}
          clickNext={() => changeSlide(currentSlideIndex + 1)}
        >
          Slide {currentSlideIndex + 1} of {slides?.length || 0}
        </Navigation>
      </div>}
      <div className='prose overflow-y-auto'>
        <section>
          {/* @ts-ignore */}
          <h2>{currentSlide.properties["Name"].title!.map(fragment => fragment.plain_text).join()}</h2>
          {/* @ts-ignore */}
          {currentSlide.properties["Member notes"].rich_text!.map((fragment, i) =>
            <div key={i} dangerouslySetInnerHTML={{ __html: markdownToHtml(fragment.plain_text) }} />
          )}
        </section>
        {isLoggedIn && <section className='rounded-lg px-4 py-3 bg-yellow-100'>
          <h4>Speaker notes</h4>
          {/* @ts-ignore */}
          {currentSlide.properties["Speaker notes"].rich_text!.map((fragment, i) =>
            <div key={i} dangerouslySetInnerHTML={{ __html: markdownToHtml(fragment.plain_text) }} />
          )}
        </section>}
      </div>
    </div>
  )
}