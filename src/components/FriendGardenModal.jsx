import dallaeCharacter from '../assets/dallae-character.png'
import { cycleGrowthSeconds, goalSkills, growthStageIndex, nextBloomDurationSeconds } from '../data/model'
import { formatHm } from '../data/growth'

export default function FriendGardenModal({ username, backup, loading, error, onClose }) {
  if (username == null) return null
  const goals = backup ? goalSkills(backup) : []

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card friend-garden-card" onClick={(e) => e.stopPropagation()}>
        <h2>{username}님의 목표</h2>
        {loading && <p className="empty-hint" style={{ textAlign: 'center' }}>불러오는 중...</p>}
        {!loading && error && <p className="empty-hint" style={{ textAlign: 'center' }}>{error}</p>}
        {!loading && !error && backup && (
          <>
            <p className="scientific" style={{ marginBottom: 12 }}>
              {backup.gardenPlants.length}송이 피어남
            </p>
            {goals.length === 0 ? (
              <p className="empty-hint" style={{ textAlign: 'center' }}>아직 심은 목표가 없어요.</p>
            ) : (
              <div className="friend-goal-list">
                {goals.map((skill) => {
                  const blooms = backup.gardenPlants.filter((p) => p.skillId === skill.id)
                  const target = nextBloomDurationSeconds(blooms)
                  const growth = cycleGrowthSeconds(skill.investedSeconds, blooms)
                  const stage = growthStageIndex(growth, target)
                  const pct = Math.min(100, (growth / target) * 100)
                  return (
                    <div className="friend-goal-row" key={skill.id}>
                      <img src={dallaeCharacter} alt="" className={`friend-goal-icon stage-${stage}`} />
                      <div className="friend-goal-info">
                        <div className="friend-goal-name">
                          {skill.name}
                          {blooms.length > 0 && <span className="goal-bloom-count"> 🌸×{blooms.length}</span>}
                        </div>
                        <div className="goal-progress-track">
                          <div className="goal-progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="goal-meta">
                          <span>{formatHm(skill.investedSeconds)} 투자됨</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
        <button className="modal-close" onClick={onClose}>닫기</button>
      </div>
    </div>
  )
}
