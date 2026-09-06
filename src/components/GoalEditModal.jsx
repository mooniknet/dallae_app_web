import { useState } from 'react'

export default function GoalEditModal({ skill, onSave, onClose }) {
  const [name, setName] = useState(skill?.name ?? '')
  const [detail, setDetail] = useState(skill?.detail ?? '')
  if (!skill) return null

  function handleSubmit(e) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    onSave(trimmedName, detail.trim())
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>목표 수정</h2>
        <form onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>목표 이름</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required />
          </label>
          <label className="auth-field">
            <span>목표 내용</span>
            <textarea
              className="timer-note-input"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="이 목표에 대한 설명을 적어보세요 (선택)"
              maxLength={300}
              rows={4}
            />
          </label>
          <button className="goal-reveal-btn" style={{ width: '100%', marginTop: 4 }} type="submit">
            저장
          </button>
        </form>
        <button className="modal-close" onClick={onClose}>닫기</button>
      </div>
    </div>
  )
}
