import { useState } from 'react'
import { FLOWERS, FLOWER_BLOOM_ORDER, flowerById } from '../data/flowers'
import FlowerDetailModal from './FlowerDetailModal'

export default function FlowerBookScreen({ backup }) {
  const [viewFlower, setViewFlower] = useState(null)
  const unlockedIds = new Set(backup.gardenPlants.map((p) => p.flowerId))

  return (
    <div>
      <h2 className="section-title">
        꽃 도감 ({unlockedIds.size}/{FLOWERS.length})
      </h2>
      <div className="flower-grid">
        {FLOWER_BLOOM_ORDER.map((flowerId, index) => {
          const flower = flowerById(flowerId)
          const unlocked = unlockedIds.has(flower.id)
          return (
            <div
              key={flower.id}
              className={`flower-tile${unlocked ? '' : ' locked'}`}
              onClick={() => unlocked && setViewFlower(flower)}
            >
              <div className="flower-tile-box">
                {unlocked ? <img src={flower.icon} alt={flower.nameKo} /> : <span className="flower-lock">🔒</span>}
              </div>
              <span className="flower-tile-name">{unlocked ? flower.nameKo : '미발견 꽃'}</span>
              <span className="flower-tile-index">{index + 1}/{FLOWER_BLOOM_ORDER.length}</span>
            </div>
          )
        })}
      </div>
      <FlowerDetailModal flower={viewFlower} onClose={() => setViewFlower(null)} />
    </div>
  )
}
