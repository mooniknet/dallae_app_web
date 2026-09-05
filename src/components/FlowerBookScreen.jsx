import { useState } from 'react'
import { FLOWERS } from '../data/flowers'
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
        {FLOWERS.map((flower) => {
          const unlocked = unlockedIds.has(flower.id)
          return (
            <div
              key={flower.id}
              className={`flower-tile${unlocked ? '' : ' locked'}`}
              onClick={() => unlocked && setViewFlower(flower)}
            >
              <img src={flower.icon} alt={unlocked ? flower.nameKo : '???'} />
              <span>{unlocked ? flower.nameKo : '???'}</span>
            </div>
          )
        })}
      </div>
      <FlowerDetailModal flower={viewFlower} onClose={() => setViewFlower(null)} />
    </div>
  )
}
