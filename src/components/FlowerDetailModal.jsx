export default function FlowerDetailModal({ flower, onClose }) {
  if (!flower) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <img src={flower.image ?? flower.icon} alt={flower.nameKo} />
        <h2>{flower.nameKo}</h2>
        <div className="scientific">{flower.scientificName}</div>
        <div className="modal-row">
          <span>영문 이름</span>
          <strong>{flower.nameEn}</strong>
        </div>
        <div className="modal-row">
          <span>희귀도</span>
          <strong>{flower.rarityKo}</strong>
        </div>
        <div className="modal-row">
          <span>개화 시기</span>
          <strong>{flower.bloomKo}</strong>
        </div>
        <div className="modal-row">
          <span>서식지</span>
          <strong>{flower.habitatKo}</strong>
        </div>
        <div className="modal-row">
          <span>꽃말</span>
          <strong>{flower.meaningKo}</strong>
        </div>
        <p className="modal-desc">{flower.descriptionKo}</p>
        <button className="modal-close" onClick={onClose}>닫기</button>
      </div>
    </div>
  )
}
