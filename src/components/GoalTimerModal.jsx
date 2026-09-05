import { cycleGrowthSeconds, growthStageIndex, nextBloomDurationSeconds } from '../data/model'
import { GROWTH_STAGE_IMAGES, formatClock, formatHm } from '../data/growth'

export default function GoalTimerModal({ skill, gardenPlants, now, runningTimers, onStartTimer, onStopTimer, onReveal, onClose }) {
  if (!skill) return null
  const blooms = gardenPlants.filter((p) => p.skillId === skill.id)
  const runningSince = runningTimers[skill.id]
  const liveSeconds = runningSince ? (now - runningSince) / 1000 : 0
  const totalSeconds = skill.investedSeconds + liveSeconds
  const target = nextBloomDurationSeconds(blooms)
  const growth = cycleGrowthSeconds(totalSeconds, blooms)
  const stage = growthStageIndex(growth, target)
  const ready = growth >= target && !skill.completed
  const pct = Math.min(100, (growth / target) * 100)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <img src={GROWTH_STAGE_IMAGES[stage]} alt="" />
        <h2>{skill.name}</h2>
        {runningSince && <div className="goal-live-clock" style={{ marginBottom: 10 }}>⏱ {formatClock(liveSeconds)}</div>}
        <div className="goal-progress-track" style={{ margin: '0 0 14px' }}>
          <div className="goal-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="modal-row">
          <span>투자된 시간</span>
          <strong>{formatHm(totalSeconds)}</strong>
        </div>
        <div className="modal-row">
          <span>다음 개화 목표</span>
          <strong>{formatHm(target)}</strong>
        </div>
        {skill.completed ? (
          <p className="empty-hint" style={{ textAlign: 'center', marginTop: 14 }}>이미 꽃을 피운 목표예요 🌸</p>
        ) : ready ? (
          <button className="goal-reveal-btn" style={{ width: '100%', marginTop: 16 }} onClick={() => onReveal(skill.id)}>
            🌱 꽃 피우기
          </button>
        ) : (
          <button
            className={`goal-timer-btn${runningSince ? ' running' : ''}`}
            style={{ width: '100%', marginTop: 16 }}
            onClick={() => (runningSince ? onStopTimer(skill.id) : onStartTimer(skill.id))}
          >
            {runningSince ? '⏸ 타이머 정지' : '▶ 타이머 시작'}
          </button>
        )}
        <button className="modal-close" onClick={onClose}>닫기</button>
      </div>
    </div>
  )
}
