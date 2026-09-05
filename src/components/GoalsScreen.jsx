import { useState } from 'react'
import {
  MAX_GOAL_SEEDS,
  cycleGrowthSeconds,
  goalSkills,
  growthStageIndex,
  nextBloomDurationSeconds,
} from '../data/model'
import { GROWTH_STAGE_IMAGES, formatClock, formatHm } from '../data/growth'
import GoalTimerModal from './GoalTimerModal'

export default function GoalsScreen({ backup, now, runningTimers, onStartTimer, onStopTimer, onAddGoal, onReveal }) {
  const [newName, setNewName] = useState('')
  const [viewGoalId, setViewGoalId] = useState(null)
  const goals = goalSkills(backup)
  const viewGoal = viewGoalId != null ? backup.skills.find((s) => s.id === viewGoalId) : null

  function handleAdd(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    onAddGoal(name)
    setNewName('')
  }

  return (
    <div>
      <h2 className="section-title">목표 씨앗 ({goals.length}/{MAX_GOAL_SEEDS})</h2>
      <div className="goals-grid">
        {goals.map((skill) => {
          const blooms = backup.gardenPlants.filter((p) => p.skillId === skill.id)
          const runningSince = runningTimers[skill.id]
          const liveSeconds = runningSince ? (now - runningSince) / 1000 : 0
          const totalSeconds = skill.investedSeconds + liveSeconds
          const target = nextBloomDurationSeconds(blooms)
          const growth = cycleGrowthSeconds(totalSeconds, blooms)
          const stage = growthStageIndex(growth, target)
          const ready = growth >= target && !skill.completed
          const pct = Math.min(100, (growth / target) * 100)

          return (
            <div className="goal-card" key={skill.id}>
              <h3>{skill.name}</h3>
              <img
                className={`goal-stage-img${runningSince ? ' timer-active' : ''}`}
                src={GROWTH_STAGE_IMAGES[stage]}
                alt=""
              />
              <div className="goal-progress-track">
                <div className="goal-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              {runningSince && <div className="goal-live-clock">⏱ {formatClock(liveSeconds)}</div>}
              <div className="goal-meta">
                <span>{formatHm(totalSeconds)} 투자됨</span>
                <span>목표 {formatHm(target)}</span>
              </div>
              {skill.completed ? (
                <div className="empty-hint">이미 꽃을 피운 목표예요 🌸</div>
              ) : ready ? (
                <button className="goal-reveal-btn" onClick={() => onReveal(skill.id)}>
                  🌱 꽃 피우기
                </button>
              ) : (
                <button
                  className={`goal-timer-btn${runningSince ? ' running' : ''}`}
                  onClick={() => (runningSince ? onStopTimer(skill.id) : onStartTimer(skill.id))}
                >
                  {runningSince ? '⏸ 타이머 정지' : '▶ 타이머 시작'}
                </button>
              )}
              <button className="goal-log-link" onClick={() => setViewGoalId(skill.id)}>
                성장 기록 보기 →
              </button>
            </div>
          )
        })}

        {goals.length < MAX_GOAL_SEEDS && (
          <form className="add-goal-card" onSubmit={handleAdd}>
            <span>새 목표 씨앗 심기</span>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="목표 이름"
              maxLength={40}
            />
            <button type="submit">씨앗 심기</button>
          </form>
        )}
      </div>
      <GoalTimerModal
        skill={viewGoal}
        gardenPlants={backup.gardenPlants}
        timeLogs={viewGoal ? backup.timeLogs.filter((l) => l.skillId === viewGoal.id) : []}
        now={now}
        runningTimers={runningTimers}
        onStartTimer={onStartTimer}
        onStopTimer={onStopTimer}
        onReveal={(skillId) => {
          onReveal(skillId)
          setViewGoalId(null)
        }}
        onClose={() => setViewGoalId(null)}
      />
    </div>
  )
}
