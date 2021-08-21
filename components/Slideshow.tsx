import { Page } from '@notionhq/client/build/src/api-types';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { subscribeToRoomBySlug, updateRoom } from '../data/room';
import { Room } from '../types/supabase';
import { markdownToHtml } from '../data/markdown';
import { useKeyPress, keyToCode } from '../utils/hooks';

export function Slideshow({ slides, room }: {
  slides: Page[],
  room: Room
}) {
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

  useEffect(() => {
    document.addEventListener('keydown', (event) => {
      var keyValue = event.key;
      var codeValue = event.code;
     
      console.log("keyValue: " + keyValue);
      console.log("codeValue: " + codeValue);
    }, false);

    return 
  }, [])

  return (
    <>
      <div>
        <button onClick={() => changeSlide(currentSlideIndex - 1)}>
          &larr; Previous
        </button>
        <span>
          Slide {currentSlideIndex + 1} of {slides?.length || 0}
        </span>
        <button onClick={() => changeSlide(currentSlideIndex + 1)}>
          Next slide &rarr;
        </button>
      </div>
      <div>
        {/* <pre>{JSON.stringify(currentSlide, null, 2)}</pre> */}
        <h2>{currentSlide.properties["Name"].title!.map(fragment => fragment.plain_text).join()}</h2>
        <h4>Member notes</h4>
        {currentSlide.properties["Member notes"].rich_text!.map((fragment, i) =>
          <p key={i} dangerouslySetInnerHTML={{ __html: markdownToHtml(fragment.plain_text) }} />
        )}
        <h4>Speaker notes</h4>
        {currentSlide.properties["Speaker notes"].rich_text!.map((fragment, i) =>
          <p key={i} dangerouslySetInnerHTML={{ __html: markdownToHtml(fragment.plain_text) }} />
        )}
      </div>
    </>
  )
}