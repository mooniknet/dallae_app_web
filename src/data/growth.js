import seed from '../assets/growth/growth_stage_1_seed.png'
import germinating from '../assets/growth/growth_stage_2_germinating.png'
import sprout from '../assets/growth/growth_stage_3_sprout.png'
import leafy from '../assets/growth/growth_stage_4_leafy.png'
import bloomReady from '../assets/growth/growth_stage_5_bloom_ready.png'

export const GROWTH_STAGE_IMAGES = {
  1: seed,
  2: germinating,
  3: sprout,
  4: leafy,
  5: bloomReady,
}

export function formatHm(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}시간 ${m}분`
  return `${m}분`
}
