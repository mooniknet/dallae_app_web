import { useRef, useState } from 'react'
import { FLOWER_EMOJI, flowerById } from '../data/flowers'
import { cycleGrowthSeconds, goalSkills, growthStageIndex, nextBloomDurationSeconds, seedPlotPosition } from '../data/model'
import { GROWTH_STAGE_EMOJI } from '../data/growth'
import FlowerDetailModal from './FlowerDetailModal'
import GoalTimerModal from './GoalTimerModal'

export default function GardenScreen({
  backup,
  now,
  runningTimers,
  onStartTimer,
  onStopTimer,
  onReveal,
  onMoveSeed,
  onMovePlant,
  onMoveCommit,
}) {
  const stageRef = useRef(null)
  const [dragId, setDragId] = useState(null)
  const [viewFlower, setViewFlower] = useState(null)
  const [viewGoalId, setViewGoalId] = useState(null)
  const draggedRef = useRef(false)

  const growingGoals = goalSkills(backup).filter((s) => !s.completed)
  const viewGoal = viewGoalId != null ? backup.skills.find((s) => s.id === viewGoalId) : null

  function handlePointerDown(e, id) {
    e.currentTarget.setPointerCapture(e.pointerId)
    draggedRef.current = false
    setDragId(id)
  }

  function handlePointerMove(e, id, onMove) {
    if (dragId !== id || !stageRef.current) return
    draggedRef.current = true
    const rect = stageRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    onMove(id, x, y)
  }

  function handlePointerUp(e, id, onTap) {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragId(null)
    if (draggedRef.current) {
      onMoveCommit()
    } else {
      onTap()
    }
  }

  return (
    <div>
      <h2 className="section-title">나의 정원 ({backup.gardenPlants.length}송이)</h2>
      {backup.gardenPlants.length === 0 && growingGoals.length === 0 && (
        <p className="empty-hint">'목표' 탭에서 목표를 심고 시간을 투자해 첫 꽃을 피워보세요.</p>
      )}
      <div className="garden-stage" ref={stageRef}>
        {growingGoals.map((skill, index) => {
          const [autoX, autoY] = seedPlotPosition(index, growingGoals.length)
          const x = skill.positionCustomized ? skill.x : autoX
          const y = skill.positionCustomized ? skill.y : autoY
          const blooms = backup.gardenPlants.filter((p) => p.skillId === skill.id)
          const target = nextBloomDurationSeconds(blooms)
          const runningSince = runningTimers[skill.id]
          const liveSeconds = runningSince ? (now - runningSince) / 1000 : 0
          const growth = cycleGrowthSeconds(skill.investedSeconds + liveSeconds, blooms)
          const stage = growthStageIndex(growth, target)
          return (
            <div
              key={skill.id}
              className={`garden-plant${dragId === skill.id ? ' dragging' : ''}`}
              style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
              onPointerDown={(e) => handlePointerDown(e, skill.id)}
              onPointerMove={(e) => handlePointerMove(e, skill.id, onMoveSeed)}
              onPointerUp={(e) => handlePointerUp(e, skill.id, () => setViewGoalId(skill.id))}
            >
              <span className={`stage-emoji${runningSince ? ' timer-active' : ''}`}>{GROWTH_STAGE_EMOJI[stage]}</span>
              <span>{runningSince ? `⏱ ${skill.name}` : skill.name}</span>
            </div>
          )
        })}

        {backup.gardenPlants.map((plant) => {
          const skill = backup.skills.find((s) => s.id === plant.skillId)
          const flower = flowerById(plant.flowerId)
          return (
            <div
              key={plant.skillId}
              className={`garden-plant${dragId === plant.skillId ? ' dragging' : ''}`}
              style={{ left: `${plant.x * 100}%`, top: `${plant.y * 100}%` }}
              onPointerDown={(e) => handlePointerDown(e, plant.skillId)}
              onPointerMove={(e) => handlePointerMove(e, plant.skillId, onMovePlant)}
              onPointerUp={(e) => handlePointerUp(e, plant.skillId, () => setViewFlower(flowerById(plant.flowerId)))}
            >
              <span className="flower-emoji">{FLOWER_EMOJI}</span>
              <span>{skill?.name ?? flower.nameKo}</span>
            </div>
          )
        })}
      </div>
      <FlowerDetailModal flower={viewFlower} onClose={() => setViewFlower(null)} />
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
