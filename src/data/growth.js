// Generic emoji stand-ins -- the real growth-stage artwork stays mobile-only.
export const GROWTH_STAGE_EMOJI = {
  1: '🫘',
  2: '🌱',
  3: '🌿',
  4: '🪴',
  5: '🌸',
}

export function formatHm(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}시간 ${m}분`
  return `${m}분`
}

// H:MM:SS (or MM:SS) live clock, so a running timer visibly ticks second by second.
export function formatClock(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

// Ported from formatActivityLogDate/-Year/formatLogDuration in the app.
export function formatLogDate(endedAtMillis) {
  const d = new Date(endedAtMillis)
  const time = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${time}`
}

export function formatLogYear(endedAtMillis) {
  return `${new Date(endedAtMillis).getFullYear()}년`
}

export function formatLogDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) return `${hours}시간 ${minutes}분`
  if (minutes > 0) return `${minutes}분`
  return '1분 미만'
}
