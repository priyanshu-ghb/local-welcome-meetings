import MockDate from 'mockdate'
import { utcToZonedTime } from 'date-fns-tz';
import { getTimezone } from '../utils/date';
import { logToDebug } from './debug';

export async function synchroniseTimeToServer() {
  logToDebug("client_browser_time", { time: new Date(), oldTime: new Date() });
  const res = await fetch((new URL('/api/time', process.env.NEXT_PUBLIC_BASEURL)).toString())
  const { time } = await res.json()
  const serverTime = utcToZonedTime(new Date(time), getTimezone())
  MockDate.set(serverTime)
  logToDebug("synchronised_time", { time: new Date(), newTime: new Date() });
  return new Date()
}