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
  const [user, isLoggedIn] = useUser()
  const [room, updateRoom] = useRoom(_room.slug, _room)

  const safeSlideIndex = useCallback((index: number) => {
    return Math.max(0, Math.min(slides.length - 1, index))
  }, [slides])

  const currentSlide = useMemo(() => {
    return slides[safeSlideIndex(room.currentSlideIndex)]
  }, [slides, room.currentSlideIndex, safeSlideIndex])

  return (
    <div className='prose'>
      <section className='p-4'>
        {/* @ts-ignore */}
        <h2 className='!mt-0'>{currentSlide.properties["Name"].title!.map(fragment => fragment.plain_text).join()}</h2>
        {/* @ts-ignore */}
        {currentSlide.properties["Member notes"].rich_text!.map((fragment, i) =>
          <div key={i} dangerouslySetInnerHTML={{ __html: markdownToHtml(fragment.plain_text) }} />
        )}
      </section>
      {isLoggedIn && <section className='rounded-lg p-4 mx-4 bg-yellow-100'>
        <h4 className='!mt-0'>Speaker notes</h4>
        {/* @ts-ignore */}
        {currentSlide.properties["Speaker notes"].rich_text!.map((fragment, i) =>
          <div key={i} dangerouslySetInnerHTML={{ __html: markdownToHtml(fragment.plain_text) }} />
        )}
      </section>}
      <div className='pt-4' />
    </div>
  )
}

export function SlideshowControls({ slides, room: _room }: {
  slides: Page[],
  room: Room
}) {
  const [user, isLoggedIn] = useUser()
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

  return isLoggedIn ? <div>
    <Navigation
      clickPrevious={() => changeSlide(room.currentSlideIndex - 1)}
      clickNext={() => changeSlide(room.currentSlideIndex + 1)}
    >
      Slide {room.currentSlideIndex + 1} of {slides?.length || 0}
    </Navigation>
  </div> : null
}