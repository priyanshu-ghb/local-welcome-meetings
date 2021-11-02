import { isServer } from '../styles/screens';
import { create } from 'timesync/dist/timesync'
import { useEffect, useRef, useState, createContext, useContext } from 'react';

const initialContext = {
  offset: 0,
  createServerDate: (d: Date) => new Date(d.getTime() + 0),
  getServerDate: () => new Date(),
  connectionEstablished: false
}

export type ITimeContext = typeof initialContext

export const TimeContext = createContext(initialContext)

export const TimeProvider = ({ children }: { children?: any }) => {
  const ts = useRef<{
    on(event: string, fn: (offset: number) =>void ): void,
    now(): number,
    destroy(): void
  }>()

  const [offset, setOffset] = useState(0)

  const context: ITimeContext = {
    offset,
    getServerDate: () => new Date(ts.current?.now() || new Date()),
    createServerDate: (date) => new Date(date.getTime() + offset),
    connectionEstablished: ts.current?.now() !== undefined
  }

  useEffect(() => {
    if (isServer) return

    ts.current = create({
      server: new URL('/api/time', window.location.toString()),
      interval: 10000
    });

    // get notified on changes in the offset
    ts.current?.on('change', function (offset) {
      setOffset(offset)
    })

    return () => ts.current?.destroy()
  }, [])

  return <TimeContext.Provider value={context}>{children}</TimeContext.Provider>
}

export const useServerTime = () => {
  return useContext(TimeContext)
}