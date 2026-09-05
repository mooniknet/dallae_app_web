// Growth-loop rules ported from the Android app's MainActivity.kt so a goal
// planted on mobile and on web reach bloom at the same invested-time targets.
export const GROWTH_HOUR_SECONDS = 60 * 60
export const MAX_GOAL_SEEDS = 8
export const ORIGIN_SKILL_ID = 1

export function nextBloomDurationSeconds(bloomsForSkill) {
  return (bloomsForSkill.length + 1) * GROWTH_HOUR_SECONDS
}

export function completedBloomGrowthSeconds(bloomsForSkill) {
  return bloomsForSkill.reduce((sum, _, index) => sum + (index + 1) * GROWTH_HOUR_SECONDS, 0)
}

export function cycleGrowthSeconds(totalSeconds, bloomsForSkill) {
  return Math.max(0, totalSeconds - completedBloomGrowthSeconds(bloomsForSkill))
}

// 5 stages: seed / germinating / sprout / leafy / bloom-ready
export function growthStageIndex(growthSeconds, targetSeconds) {
  if (growthSeconds >= targetSeconds) return 5
  if (growthSeconds >= (targetSeconds * 3) / 4) return 4
  if (growthSeconds >= targetSeconds / 2) return 3
  if (growthSeconds >= targetSeconds / 4) return 2
  return 1
}

const SEED_PLOT_LAYOUTS = {
  1: [[0.5, 0.5]],
  2: [[0.32, 0.48], [0.68, 0.48]],
  3: [[0.3, 0.39], [0.7, 0.39], [0.5, 0.68]],
  4: [[0.3, 0.3], [0.7, 0.31], [0.3, 0.7], [0.7, 0.71]],
  5: [[0.31, 0.24], [0.69, 0.25], [0.5, 0.5], [0.3, 0.77], [0.7, 0.78]],
  6: [[0.31, 0.22], [0.69, 0.23], [0.28, 0.5], [0.72, 0.51], [0.34, 0.78], [0.66, 0.79]],
  7: [[0.32, 0.17], [0.68, 0.18], [0.25, 0.39], [0.75, 0.4], [0.5, 0.61], [0.27, 0.83], [0.73, 0.84]],
  8: [[0.32, 0.17], [0.68, 0.18], [0.25, 0.39], [0.75, 0.4], [0.34, 0.61], [0.66, 0.62], [0.27, 0.83], [0.73, 0.84]],
}

export function seedPlotPosition(index, totalCount) {
  const layout = SEED_PLOT_LAYOUTS[Math.min(Math.max(totalCount, 1), MAX_GOAL_SEEDS)] ?? SEED_PLOT_LAYOUTS[8]
  return layout[index % layout.length]
}

function nowMillis() {
  return Date.now()
}

export function createDefaultBackup() {
  return {
    format: 'LifeForgeBackup',
    version: 1,
    exportedAtMillis: nowMillis(),
    settings: {
      appTitle: 'Dallae',
      language: 'ko',
      reminderEnabled: false,
      reminderMinutes: 0,
      advancedFeatures: false,
      selectedGardenBackgroundId: 'forest',
      unlockedGardenBackgroundIds: ['forest'],
      growDays: 1,
    },
    skills: [
      {
        id: ORIGIN_SKILL_ID,
        name: 'Origin',
        detail: '',
        symbol: '✦',
        x: 0.5,
        y: 0.5,
        accent: -8355712,
        mapId: ORIGIN_SKILL_ID,
        expanded: false,
        investedSeconds: 0,
        completed: false,
        passive: false,
        positionCustomized: false,
      },
    ],
    links: [],
    timeLogs: [],
    messages: [],
    gardenPlants: [],
    pictureSkillIds: [],
  }
}

// Goals are skills directly under Origin's map, excluding Origin itself.
export function goalSkills(backup) {
  return backup.skills.filter((s) => s.id !== ORIGIN_SKILL_ID && s.mapId === ORIGIN_SKILL_ID && !s.passive)
}

const ACCENT_PALETTE = [-4996352, -10701871, -6299648, -13849601, -1284034, -8825528]

export function addGoal(backup, name, detail = '') {
  const goals = goalSkills(backup)
  if (goals.length >= MAX_GOAL_SEEDS) throw new Error('MAX_GOAL_SEEDS reached')
  const nextId = Math.max(...backup.skills.map((s) => s.id)) + 1
  const [x, y] = seedPlotPosition(goals.length, goals.length + 1)
  const skill = {
    id: nextId,
    name,
    detail,
    symbol: '✦',
    x,
    y,
    accent: ACCENT_PALETTE[goals.length % ACCENT_PALETTE.length],
    mapId: ORIGIN_SKILL_ID,
    expanded: false,
    investedSeconds: 0,
    completed: false,
    passive: false,
    positionCustomized: false,
  }
  return { ...backup, skills: [...backup.skills, skill] }
}

export function addInvestedSeconds(backup, skillId, seconds, endedAtMillis = nowMillis()) {
  if (seconds <= 0) return backup
  const skills = backup.skills.map((s) =>
    s.id === skillId ? { ...s, investedSeconds: s.investedSeconds + seconds } : s
  )
  const logId = (backup.timeLogs.reduce((max, l) => Math.max(max, l.id), 0) || 0) + 1
  const timeLogs = [
    ...backup.timeLogs,
    {
      id: logId,
      skillId,
      endedAtMillis,
      durationSeconds: seconds,
      entryType: 'TIMER',
      contentTitle: '',
      contentUrl: '',
      note: '',
      contentKind: 'CONTENT',
    },
  ]
  return { ...backup, skills, timeLogs }
}

export function revealFlower(backup, skillId, flowerId) {
  const skillIndex = backup.skills.findIndex((s) => s.id === skillId)
  if (skillIndex === -1) throw new Error('skill not found')
  const slot = backup.gardenPlants.length
  const plant = {
    skillId,
    x: Math.min(0.22 + (slot % 3) * 0.28, 0.82),
    y: Math.min(0.34 + Math.floor(slot / 3) * 0.18, 0.82),
    plantedAtMillis: nowMillis(),
    flowerId,
  }
  const skills = backup.skills.map((s, i) =>
    i === skillIndex ? { ...s, completed: true, symbol: `flower:${flowerId}` } : s
  )
  return { ...backup, skills, gardenPlants: [...backup.gardenPlants, plant] }
}

export function moveSeed(backup, skillId, x, y) {
  const skills = backup.skills.map((s) =>
    s.id === skillId
      ? { ...s, x: Math.min(Math.max(x, 0.1), 0.9), y: Math.min(Math.max(y, 0.12), 0.88), positionCustomized: true }
      : s
  )
  return { ...backup, skills }
}

export function movePlant(backup, skillId, x, y) {
  const gardenPlants = backup.gardenPlants.map((p) =>
    p.skillId === skillId ? { ...p, x: Math.min(Math.max(x, 0.1), 0.9), y: Math.min(Math.max(y, 0.12), 0.88) } : p
  )
  return { ...backup, gardenPlants }
}
