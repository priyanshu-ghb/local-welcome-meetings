import { Room } from '../types/app';
import { useForm } from 'react-hook-form';
import { useSlideshowOptions } from '../data/slideshow-client';
import { Fragment, Suspense, useMemo } from 'react';
import slugify from 'slugify'
import { createRoom } from '../data/room';
import Modal from './Modal';

export default function CreateRoomModal({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: Function }) {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <CreateRoom onFormComplete={() => setIsOpen(false)} />
    </Modal>
  )
}

export function CreateRoom ({ onFormComplete }: { onFormComplete?: Function }) {
  const defaultValues: Omit<Room, 'id' | 'updatedAt'> = {
    currentSlideIndex: 0,
    // @ts-ignore
    timerStartTime: new Date(),
    timerState: "stopped",
    timerDuration: 90
  }

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues
  });

  const { name } = watch()

  const suggestedSlug = useMemo(() => (name?.length ? slugify(name) : 'slug').trim().toLowerCase(), [name])

  const onSubmit = async (data: typeof defaultValues) => {
    createRoom({
      ...data,
      slug: (data.slug || suggestedSlug).toLowerCase().trim(),
    })
    reset()
    if (onFormComplete) onFormComplete()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="shadow overflow-hidden sm:rounded-md">
        <div className="p-4 sm:p-5 bg-white">
          <h3 className='text-2xl mb-4 text-left'>Create a new room</h3>
          <div className="grid grid-flow-row gap-2">
            <div key='name'>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input type='text' {...register("name", { required: true })} id='name' className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>

            <div key='slug'>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Video call URL</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  https://session.adhdtogether.org/
                </span>
                <input placeholder={suggestedSlug} type='text' {...register("slug", { pattern: /^[a-z](-?[a-z])*$/i })} id='slug' className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300" />
              </div>
            </div>

            <div key='slideshow'>
              <label htmlFor="slideshow" className="block text-sm font-medium text-gray-700">Slideshow</label>
              <select {...register("slideshowName", { required: true })} id='slideshowName' className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <Suspense fallback={<option>Loading...</option>}>
                  <SlideshowDropdownOptions />
                </Suspense>
              </select>
            </div>

            <div key='hubspot'>
              <label htmlFor="hubspotLeaderListId" className="block text-sm font-medium text-gray-700">(Optional) Hubspot Leaders List ID</label>
              <input type='number' {...register("hubspotLeaderListId")} id='hubspotLeaderListId' className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              <p className='text-sm text-gray-500'>A Hubspot list for room-specific leaders. This is in addition to the global Hubspot leaders list. Numerical ID is found in the URL of the Hubspot list.</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-5">
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Create room
          </button>
        </div>
      </div>
    </form>
  )
}

function SlideshowDropdownOptions() {
  const slideshowOptions = useSlideshowOptions()
  return <Fragment>
    {slideshowOptions.data?.slideshowOptions.map(({ name, id }) => (
      <option key={id} value={name}>{name}</option>
    ))}
  </Fragment>
}