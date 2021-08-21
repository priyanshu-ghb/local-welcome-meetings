import { Block } from '@notionhq/client/build/src/api-types';

export function Slideshow ({ slides, roomId }: {
  slides: Block[] | null,
  roomId: number 
}) {
  const room = supabase
    .from('room:column_name=eq.someValue')
    .on('*', payload => {
      console.log('Change received!', payload)
    })
    .subscribe()
    
  return (
    <>
      <div>
        Slide {currentSlideIndex} of {slides?.length || 0}
      </div>
      <div>
        <pre>{JSON.stringify(currentSlide, null, 2)}</pre>
        <h3></h3>
      </div>
    </>
  )
}