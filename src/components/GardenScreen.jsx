import { useRef, useState } from 'react'
import { flowerById } from '../data/flowers'
import gardenBg from '../assets/garden-bg.png'
import FlowerDetailModal from './FlowerDetailModal'

export default function GardenScreen({ backup, onMovePlant }) {
  const stageRef = useRef(null)
  const [dragId, setDragId] = useState(null)
  const [viewFlower, setViewFlower] = useState(null)
  const draggedRef = useRef(false)

  function handlePointerDown(skillId) {
    draggedRef.current = false
    setDragId(skillId)
  }

  function handlePointerMove(e) {
    if (dragId == null || !stageRef.current) return
    draggedRef.current = true
    const rect = stageRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    onMovePlant(dragId, x, y)
  }

  function handlePointerUp(skillId) {
    setDragId(null)
    if (!draggedRef.current) {
      const plant = backup.gardenPlants.find((p) => p.skillId === skillId)
      if (plant) setViewFlower(flowerById(plant.flowerId))
    }
  }

  return (
    <div>
      <h2 className="section-title">나의 정원 ({backup.gardenPlants.length}송이)</h2>
      {backup.gardenPlants.length === 0 && (
        <p className="empty-hint">목표를 심고 시간을 투자해 첫 꽃을 피워보세요.</p>
      )}
      <div
        className="garden-stage"
        style={{ backgroundImage: `url(${gardenBg})` }}
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerUp={() => dragId != null && handlePointerUp(dragId)}
        onPointerLeave={() => setDragId(null)}
      >
        <div className="garden-scrim" />
        {backup.gardenPlants.map((plant) => {
          const skill = backup.skills.find((s) => s.id === plant.skillId)
          const flower = flowerById(plant.flowerId)
          return (
            <div
              key={plant.skillId}
              className="garden-plant"
              style={{ left: `${plant.x * 100}%`, top: `${plant.y * 100}%` }}
              onPointerDown={() => handlePointerDown(plant.skillId)}
              onPointerUp={() => handlePointerUp(plant.skillId)}
            >
              <img src={flower.icon} alt={flower.nameKo} draggable={false} />
              <span>{skill?.name ?? flower.nameKo}</span>
            </div>
          )
        })}
      </div>
      <FlowerDetailModal flower={viewFlower} onClose={() => setViewFlower(null)} />
    </div>
  )
}
