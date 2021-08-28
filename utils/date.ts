import jstz from 'jstz';
import cronparser from 'cron-parser'
export const getTimezone = () => jstz.determine().name()
export const parseCron = (cron: string, timezone: string, currentDate = new Date()) => {
  return cronparser.parseExpression(cron, { tz: timezone, currentDate })
}
export const getDatesForCron = (cron: string, timezone: string, count = 10, currentDate = new Date()) => {
  const schedule = parseCron(cron, timezone, currentDate)
  let i = 0;
  let dates = []
  while(i < count) {
    const next = schedule.next()
    if (next) {
      dates.push(next.toDate())
      i++
    } else {
      break
    }
  }
  return dates
}