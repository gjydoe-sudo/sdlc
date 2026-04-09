export function getSingaporeNow(): Date {
  const now = new Date()
  const sgOffset = 8 * 60
  const utcOffset = now.getTimezoneOffset()
  const diff = sgOffset + utcOffset
  return new Date(now.getTime() + diff * 60 * 1000)
}

export function formatSingaporeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })
}

export function toSingaporeISO(date: Date): string {
  return date.toLocaleString('sv-SE', { timeZone: 'Asia/Singapore' }).replace(' ', 'T')
}
