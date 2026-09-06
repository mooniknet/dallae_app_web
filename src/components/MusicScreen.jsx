import { MUSIC_THEMES } from '../data/music'

export default function MusicScreen({ volumes, onVolumeChange, blocked, onRetry }) {
  return (
    <div>
      <h2 className="section-title">배경음악</h2>
      <p className="subtitle" style={{ marginBottom: 18 }}>
        여러 소리를 동시에 켜고 각각 볼륨을 조절해서 나만의 배경음을 만들어보세요.
      </p>
      {blocked && (
        <button className="empty-hint music-blocked-hint" onClick={onRetry}>
          🔇 브라우저가 자동 재생을 막았어요. 여기를 눌러 재생하세요.
        </button>
      )}
      {MUSIC_THEMES.map((theme) => (
        <div className="music-theme" key={theme.id}>
          <h3 className="music-theme-title">{theme.name}</h3>
          <div className="music-track-list">
            {theme.tracks.map((track) => (
              <div className="music-track-row" key={track.id}>
                <span className="music-track-name">{track.name}</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volumes[track.id] ?? 0}
                  onChange={(e) => onVolumeChange(track.id, Number(e.target.value))}
                  className="music-volume-slider"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
