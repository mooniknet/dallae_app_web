export default function SettingsModal({ open, autoStopEnabled, autoStopMinutes, notifyPermission, onToggleAutoStop, onClose }) {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>설정</h2>
        <div className="settings-row">
          <div className="settings-row-text">
            <div className="settings-row-title">{autoStopMinutes}분 자동 정지</div>
            <div className="settings-row-desc">
              타이머가 {autoStopMinutes}분이 되면 브라우저 알림을 보내고 자동으로 정지해요.
            </div>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={autoStopEnabled}
              onChange={(e) => onToggleAutoStop(e.target.checked)}
            />
            <span className="switch-track" />
          </label>
        </div>
        {autoStopEnabled && notifyPermission === 'denied' && (
          <p className="empty-hint" style={{ marginTop: 10, textAlign: 'left' }}>
            브라우저 알림이 차단되어 있어요. 브라우저 주소창의 사이트 설정에서 알림을 허용해주세요.
          </p>
        )}
        <button className="modal-close" onClick={onClose}>닫기</button>
      </div>
    </div>
  )
}
