import { useRef, useState } from 'react'
import { flowerById } from '../data/flowers'
import { cycleGrowthSeconds, goalSkills, growthStageIndex, nextBloomDurationSeconds, seedPlotPosition } from '../data/model'
import { GROWTH_STAGE_IMAGES } from '../data/growth'
import gardenBg from '../assets/garden-bg.png'
import FlowerDetailModal from './FlowerDetailModal'
import GoalTimerModal from './GoalTimerModal'

export default function GardenScreen({ backup, now, runningTimers, onStartTimer, onStopTimer, onReveal, onMovePlant, onMovePlantCommit }) {
  const stageRef = useRef(null)
  const [dragId, setDragId] = useState(null)
  const [viewFlower, setViewFlower] = useState(null)
  const [viewGoalId, setViewGoalId] = useState(null)
  const draggedRef = useRef(false)

  const growingGoals = goalSkills(backup).filter((s) => !s.completed)
  const viewGoal = viewGoalId != null ? backup.skills.find((s) => s.id === viewGoalId) : null

  function handlePlantPointerDown(e, skillId) {
    e.currentTarget.setPointerCapture(e.pointerId)
    draggedRef.current = false
    setDragId(skillId)
  }

  function handlePlantPointerMove(e, skillId) {
    if (dragId !== skillId || !stageRef.current) return
    draggedRef.current = true
    const rect = stageRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    onMovePlant(skillId, x, y)
  }

  function handlePlantPointerUp(e, skillId) {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragId(null)
    if (draggedRef.current) {
      onMovePlantCommit()
    } else {
      const plant = backup.gardenPlants.find((p) => p.skillId === skillId)
      if (plant) setViewFlower(flowerById(plant.flowerId))
    }
  }

  return (
    <div>
      <h2 className="section-title">나의 정원 ({backup.gardenPlants.length}송이)</h2>
      {backup.gardenPlants.length === 0 && growingGoals.length === 0 && (
        <p className="empty-hint">'목표' 탭에서 목표를 심고 시간을 투자해 첫 꽃을 피워보세요.</p>
      )}
      <div
        className="garden-stage"
        style={{ backgroundImage: `url(${gardenBg})` }}
        ref={stageRef}
      >
        <div className="garden-scrim" />

        {growingGoals.map((skill, index) => {
          const [x, y] = seedPlotPosition(index, growingGoals.length)
          const blooms = backup.gardenPlants.filter((p) => p.skillId === skill.id)
          const target = nextBloomDurationSeconds(blooms)
          const runningSince = runningTimers[skill.id]
          const liveSeconds = runningSince ? (now - runningSince) / 1000 : 0
          const growth = cycleGrowthSeconds(skill.investedSeconds + liveSeconds, blooms)
          const stage = growthStageIndex(growth, target)
          return (
            <div
              key={skill.id}
              className="garden-plant"
              style={{ left: `${x * 100}%`, top: `${y * 100}%`, cursor: 'pointer' }}
              onClick={() => setViewGoalId(skill.id)}
            >
              <img
                className={runningSince ? 'timer-active' : ''}
                src={GROWTH_STAGE_IMAGES[stage]}
                alt={skill.name}
                draggable={false}
              />
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
              onPointerDown={(e) => handlePlantPointerDown(e, plant.skillId)}
              onPointerMove={(e) => handlePlantPointerMove(e, plant.skillId)}
              onPointerUp={(e) => handlePlantPointerUp(e, plant.skillId)}
            >
              <img src={flower.icon} alt={flower.nameKo} draggable={false} />
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
