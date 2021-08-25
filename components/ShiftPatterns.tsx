import { createContext, useState, useEffect, useContext } from 'react';
import { ShiftPattern, ShiftAllocation } from '../types/app';
import { useRoom } from '../data/room';
import { deleteShiftPattern, getShiftPatterns } from '../data/rota';
import { useUser } from '../data/auth';
import { onShiftPatternChange, onShiftAllocationChange, getShiftAllocations, createShiftPattern, createShiftAllocation } from '../data/rota';

interface IRotaContext {
  shiftPatterns: ShiftPattern[]
  shiftAllocations: ShiftAllocation[],
  createShiftPattern: (sp: Omit<ShiftPattern, 'id'>) => void
  createShiftAllocation: (sp: Omit<ShiftAllocation, 'id'>) => void
}

export const RotaContext = createContext<IRotaContext>({
  shiftPatterns: [],
  shiftAllocations: [],
  createShiftPattern: () => {},
  createShiftAllocation: () => {}
})

export const RotaContextProvider = (props: any) => {
  const { room } = useRoom()
  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>([]);
  const [shiftAllocations, setShiftAllocations] = useState<ShiftAllocation[]>([]);

  async function updateShiftPatterns (roomId: string) {
    setShiftPatterns(await getShiftPatterns(roomId))
  }

  async function updateShiftAllocations (roomId: string) {
    setShiftAllocations(await getShiftAllocations(roomId))
  }

  useEffect(() => {
    if (room) {
      updateShiftPatterns(room.id)
    }
  }, [room])

  useEffect(function () {
    let shiftUnsubscribe: () => void
    let allocationUnsubscribe: () => void

    if (room) {
      shiftUnsubscribe = onShiftPatternChange(() => updateShiftPatterns(room.id))
      allocationUnsubscribe = onShiftAllocationChange(() => updateShiftAllocations(room.id))
    }

    return () => {
      if (shiftUnsubscribe) shiftUnsubscribe()
      if (allocationUnsubscribe) allocationUnsubscribe()
    }
  }, [room])

  return <RotaContext.Provider value={{
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
  const { profile } = useUser()

  function del (id: string) {
    deleteShiftPattern(id)
  }

  return (
    <div className='space-y-4'>
      {rota.shiftPatterns?.map((shiftPattern, index) => {
        return (
          <div key={shiftPattern.id} className=''>
            <h3 className='text-lg font-bold text-adhdPurple mb-2'>{shiftPattern.name}</h3>
            {profile?.canManageShifts && <div className='button' onClick={() => del(shiftPattern.id)}>Delete</div>}
          </div>
        )
      })}
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