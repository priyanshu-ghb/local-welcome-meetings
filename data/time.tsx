import { utcToZonedTime } from 'date-fns-tz';
import { getTimezone } from '../utils/date';
import { logToDebug } from './debug';
import { differenceInMilliseconds } from 'date-fns';
import { isClient } from '../styles/screens';

let t =0

export async function getServerTimeOffset() {
  if (t === 0) logToDebug("client_browser_time", { time: new Date(), oldTime: new Date() });
  const start = performance.now();
  const res = await fetch((new URL('/api/time', process.env.NEXT_PUBLIC_BASEURL)).toString())
  const { time } = await res.json()
  const serverTime = utcToZonedTime(new Date(time), getTimezone())
  if (t === 0) logToDebug("synchronised_time", { time: new Date(), newTime: new Date() });
  const offset = differenceInMilliseconds(serverTime, new Date()) - ((performance.now() - start))
  if (isClient) {
    // @ts-ignore
    window.serverTimeOffset = offset
  }
  t++
  return offset
}

export function getServerTime (date: Date, offset: number) {
  return new Date(date.getTime() + offset)
}

if (isClient) {
  // @ts-ignore
  window.getServerTime = getServerTime
}