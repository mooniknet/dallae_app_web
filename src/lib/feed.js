import { isVisibleInJournal } from '../data/model'

// entries: [{ userId, username, backup, isOwn }]
export function buildFeedItems(entries) {
  const items = []
  for (const { userId, username, backup, isOwn } of entries) {
    if (!backup) continue
    for (const log of backup.timeLogs.filter(isVisibleInJournal)) {
      const skill = backup.skills.find((s) => s.id === log.skillId)
      if (!skill) continue
      items.push({
        ownerId: userId,
        ownerUsername: username,
        isOwn,
        skillName: skill.name,
        logId: log.id,
        durationSeconds: log.durationSeconds,
        endedAtMillis: log.endedAtMillis,
      })
    }
  }
  return items.sort((a, b) => b.endedAtMillis - a.endedAtMillis).slice(0, 50)
}
