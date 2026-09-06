import { useState } from 'react'
import {
  MAX_GOAL_SEEDS,
  cycleGrowthSeconds,
  goalSkills,
  growthStageIndex,
  nextBloomDurationSeconds,
} from '../data/model'
import { formatClock, formatHm } from '../data/growth'
import GoalTimerModal from './GoalTimerModal'
import dallaeCharacter from '../assets/dallae-character.png'

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
          const ready = growth >= target
          const pct = Math.min(100, (growth / target) * 100)

          return (
            <div className="goal-card" key={skill.id}>
              <h3>
                {skill.name}
                {blooms.length > 0 && <span className="goal-bloom-count"> 🌸×{blooms.length}</span>}
              </h3>
              <img
                src={dallaeCharacter}
                alt=""
                className={`goal-stage-icon stage-${stage}${runningSince ? ' timer-active' : ''}`}
              />
              <div className="goal-progress-track">
                <div className="goal-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              {runningSince && <div className="goal-live-clock">⏱ {formatClock(liveSeconds)}</div>}
              <div className="goal-meta">
                <span>{formatHm(totalSeconds)} 투자됨</span>
              </div>
              {ready ? (
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
