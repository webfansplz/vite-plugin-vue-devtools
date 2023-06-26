export * from './event'
export * from './storage'
export * from './screen'

export const checkIsSafari = () => navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
