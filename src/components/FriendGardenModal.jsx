import dallaeCharacter from '../assets/dallae-character.png'

export default function FriendGardenModal({ username, backup, loading, error, onClose }) {
  if (username == null) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card friend-garden-card" onClick={(e) => e.stopPropagation()}>
        <h2>{username}님의 정원</h2>
        {loading && <p className="empty-hint" style={{ textAlign: 'center' }}>불러오는 중...</p>}
        {!loading && error && <p className="empty-hint" style={{ textAlign: 'center' }}>{error}</p>}
        {!loading && !error && backup && (
          <>
            <p className="scientific" style={{ marginBottom: 12 }}>
              {backup.gardenPlants.length}송이 피어남
            </p>
            {backup.gardenPlants.length === 0 ? (
              <p className="empty-hint" style={{ textAlign: 'center' }}>아직 피어난 꽃이 없어요.</p>
            ) : (
              <div className="garden-stage friend-garden-stage">
                {backup.gardenPlants.map((plant) => {
                  const skill = backup.skills.find((s) => s.id === plant.skillId)
                  return (
                    <div
                      key={plant.skillId}
                      className="garden-plant"
                      style={{ left: `${plant.x * 100}%`, top: `${plant.y * 100}%` }}
                    >
                      <img src={dallaeCharacter} alt="" className="garden-plant-icon" />
                      <span>{skill?.name ?? '달래'}</span>
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
