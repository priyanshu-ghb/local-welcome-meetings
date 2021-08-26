import { createContext, useState, useEffect, useContext } from 'react';
import { ShiftPattern, ShiftAllocation, Profile } from '../types/app';
import { useRoom } from '../data/room';
import { deleteShiftAllocation, deleteShiftPattern, getRoomLeaders, getShiftPatterns, onRoomLeadersChange } from '../data/rota';
import { useUser } from '../data/auth';
import { onShiftPatternChange, onShiftAllocationChange, getShiftAllocations, createShiftPattern, createShiftAllocation } from '../data/rota';
import { EmojiHappyIcon, EmojiSadIcon } from '@heroicons/react/outline';
import { useCombobox, UseComboboxProps } from 'downshift';
import { Transition } from '@headlessui/react';
import { ShowFor } from './Elements';

interface IRotaContext {
  roomLeaders: Profile[];
  shiftPatterns: ShiftPattern[]
  shiftAllocations: ShiftAllocation[],
  createShiftPattern: (sp: Omit<ShiftPattern, 'id'>) => void
  createShiftAllocation: (sp: Omit<ShiftAllocation, 'id'>) => void
}

export const RotaContext = createContext<IRotaContext>({
  roomLeaders: [],
  shiftPatterns: [],
  shiftAllocations: [],
  createShiftPattern: () => {},
  createShiftAllocation: () => {}
})

export const RotaContextProvider = (props: any) => {
  const { room } = useRoom()
  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>([]);
  const [shiftAllocations, setShiftAllocations] = useState<ShiftAllocation[]>([]);
  const [roomLeaders, setRoomLeaders] = useState<Profile[]>([]);

  async function updateShiftPatterns (roomId: string) {
    setShiftPatterns(await getShiftPatterns(roomId))
  }

  async function updateShiftAllocations (roomId: string) {
    setShiftAllocations(await getShiftAllocations(roomId))
  }

  async function _getRoomLeaders (roomId: string) {
    await fetch('/api/updateProfilesForRooms');
    const leaders = await getRoomLeaders(roomId);
    setRoomLeaders(leaders.data?.map(leader => leader.profile) || [])
  }

  useEffect(() => {
    // On page view, update the list of leaders in the database
    if (room) {
      updateShiftPatterns(room.id)
      updateShiftAllocations(room.id)
      _getRoomLeaders(room.id)
    }
  }, [room])

  useEffect(function () {
    let shiftUnsubscribe: () => void
    let allocationUnsubscribe: () => void
    let leadersUnsubscribe: () => void

    if (room) {
      shiftUnsubscribe = onShiftPatternChange(() => updateShiftPatterns(room.id))
      allocationUnsubscribe = onShiftAllocationChange(() => updateShiftAllocations(room.id))
      leadersUnsubscribe = onRoomLeadersChange(() => _getRoomLeaders(room.id))
    }

    return () => {
      shiftUnsubscribe?.();
      allocationUnsubscribe?.();
      leadersUnsubscribe?.();
    }
  }, [room])

  return <RotaContext.Provider value={{
    roomLeaders,
    shiftPatterns,
    createShiftPattern: (sp) => room && createShiftPattern({ ...sp, roomId: room.id }),
    shiftAllocations,
    createShiftAllocation: (sp) => room && createShiftAllocation(sp),
  }} {...props} />
}

export const useRota = () => {
  return useContext(RotaContext)
}

export function ShiftPatterns () {
  const rota = useRota()

  return (
    <div className='space-y-4'>
      {rota.shiftPatterns?.map((shiftPattern, index) => {
        return (
          <ShiftPatternAllocations key={shiftPattern.id} shiftPattern={shiftPattern} />
        )
      })}
    </div>
  )
}

export function ShiftPatternAllocations ({ shiftPattern }: { shiftPattern: ShiftPattern }) {
  const { profile } = useUser()
  const rota = useRota()

  const allocatedSlots = rota.shiftAllocations
    .filter(({ shiftPatternId }) => shiftPatternId === shiftPattern.id)
    .sort((a, b) => a.id.localeCompare(b.id))
    
  const unfilledSlots = shiftPattern.required_people - allocatedSlots.length

  const notEnough = unfilledSlots > 0
  const justRight = unfilledSlots === 0
  const tooMany = unfilledSlots < 0

  return (
    <div key={shiftPattern.id} className=''>
      <h3 className='text-lg font-bold text-adhdPurple mb-2'>{shiftPattern.name}</h3>
      <div className={`font-bold text-sm uppercase flex justify-between w-full ${
        notEnough ? 'text-red-500' : tooMany ? 'text-yellow-600' : 'text-green-500'
      }`}>
        <span>{allocatedSlots.length} / {shiftPattern.required_people} leader slot{shiftPattern.required_people > 1 && 's'} filled</span>
        <span>{justRight ? <EmojiHappyIcon className='w-[25px] h-[25px]' /> : <EmojiSadIcon className='w-[25px] h-[25px]' />}</span>
      </div>
      <div className='space-y-2 my-2'>
        {/* {allocatedSlots.map((shiftAllocation, i) => (
          <div key={i} className='shadow-sm rounded-lg p-3 hover:bg-gray-50 transition'>
            {shiftAllocation.userId}
          </div>
        ))} */}
        {new Array(Math.max(shiftPattern.required_people, allocatedSlots.length)).fill(0).map((_, i) => {
          return (
            <ShiftAllocationEditor
              key={allocatedSlots[i]?.id || i}
              shiftAllocation={allocatedSlots[i]}
              shiftPattern={shiftPattern}
              options={rota.roomLeaders}
            />
          )
        })}
      </div>
      {profile?.canManageShifts && <div className='button' onClick={() => deleteShiftPattern(shiftPattern.id)}>Delete</div>}
    </div>
  )
}

/*
<div key={i} className='border border-dashed border-gray-400 rounded-lg p-3 hover:bg-gray-50 transition'>
  Fill vacant slot {allocatedSlots.length + i + 1}
</div>
*/

function ShiftAllocationEditor(
  { shiftPattern, options, shiftAllocation }:
  { shiftPattern: ShiftPattern, options: Profile[], shiftAllocation?: ShiftAllocation }
) {
  const [inputItems, setInputItems] = useState<Profile[]>(options)
  const [savedDataState, setDataState] = useState<null | 'loading' | 'saved' | 'error'>(null)
  const rota = useRota()

  const comboProps: UseComboboxProps<Profile> = {
    initialSelectedItem: options.find(o => o.id === shiftAllocation?.profileId),
    items: inputItems,
    itemToString: (o) => o?.email || "No person selected",
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        options.filter(profile => (
          profile.email?.startsWith(inputValue?.toLowerCase() || '') ||
          profile.firstName?.startsWith(inputValue?.toLowerCase() || '') ||
          profile.lastName?.startsWith(inputValue?.toLowerCase() || '')
        )),
      )
    },
    onSelectedItemChange: async ({ selectedItem: profile }) => {
      if (profile) {
        try {
          setDataState('loading')
          await rota.createShiftAllocation({
            shiftPatternId: shiftPattern.id,
            profileId: profile.id
          })
          setDataState('saved')
        } catch (e) {
          setDataState('error')
        }
      }
    }
  }

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    reset
  } = useCombobox<Profile>(comboProps)

  function deleteAllocation () {
    reset()
    if (shiftAllocation) {
      deleteShiftAllocation(shiftAllocation.id)
    }
  }

  return (
    <div className='relative'>
      <div className='flex flex-row justify-between border border-dashed border-gray-400 rounded-lg p-3 hover:bg-gray-50 transition' {...getComboboxProps()}>
        <input {...getInputProps()} placeholder='Fill vacant slot' />
        <button
          type="button"
          {...getToggleButtonProps()}
          aria-label="Show available staff"
        >
          &#8595;
        </button>
        <ShowFor seconds={3} key={savedDataState}>
          {savedDataState && <span className='bg-adhdBlue rounded-lg p-1 text-sm uppercase'>{savedDataState}</span>}
        </ShowFor>
        {shiftAllocation && <div onClick={deleteAllocation} className='button p-1 uppercase text-sm'>Clear</div>}
      </div>
      <Transition
        appear={true}
        show={isOpen}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <ul className='border border-gray-400 rounded-lg p-3 shadow-md absolute top-[100%] z-50 w-full bg-white' {...getMenuProps()}>
          {isOpen &&
            inputItems.map((item, index) => (
              <li
                style={
                  highlightedIndex === index
                    ? { backgroundColor: '#bde4ff' }
                    : {}
                }
                key={`${item}${index}`}
                {...getItemProps({ item, index })}
              >
                {item.email}
              </li>
            ))}
        </ul>
      </Transition>
    </div>
  )
}

export function CreateShiftPattern () {
  const { room } = useRoom()
  const rota = useRota()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!room) throw new Error("No room was available")
    rota.createShiftPattern({
      // @ts-ignore
      name: event.target.name.value,
      // @ts-ignore
      required_people: event.target.required_people.value,
      roomId: room.id
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="shadow overflow-hidden sm:rounded-md">
        <div className="p-4 sm:p-5 bg-white">
          <h3 className='text-2xl mb-4 text-left'>Add a shift pattern</h3>
          <div className="grid grid-flow-row gap-2">
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name of shift pattern</label>
              <input required type="text" name="name" id="name" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="required_people" className="block text-sm font-medium text-gray-700">Number of required people</label>
              <input required type="number" min={1} max={100} defaultValue={2} name="required_people" id="required_people" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-5">
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Create shift pattern
          </button>
        </div>
      </div>
    </form>
  )
}