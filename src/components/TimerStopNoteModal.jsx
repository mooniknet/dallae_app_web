import { useState } from 'react'

export default function TimerStopNoteModal({ skillName, onSkip, onSubmit }) {
  const [note, setNote] = useState('')
  if (skillName == null) return null

  return (
    <div className="modal-backdrop" onClick={onSkip}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>{skillName}</h2>
        <p className="subtitle" style={{ marginBottom: 16 }}>
          이번 세션에서 한 일을 적어보세요 (선택사항)
        </p>
        <textarea
          className="timer-note-input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="예: 리액트 공식 문서 읽기"
          maxLength={300}
          rows={4}
          autoFocus
        />
        <button className="goal-reveal-btn" style={{ width: '100%', marginTop: 16 }} onClick={() => onSubmit(note.trim())}>
          저장
        </button>
        <button className="modal-close" onClick={onSkip}>건너뛰기</button>
      </div>
    </div>
  )
}
