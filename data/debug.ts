export function logToDebug(eventName: string, data?: any) {
  console.debug(eventName, data)
  // @ts-ignore
  window?.posthog?.capture?.(eventName, data)
}