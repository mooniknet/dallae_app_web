import { formatLogDate, formatLogDuration, formatLogYear } from '../data/growth'

export default function GrowthLog({ logs }) {
  const sorted = [...logs].sort((a, b) => b.endedAtMillis - a.endedAtMillis)

  if (sorted.length === 0) {
    return <p className="empty-hint" style={{ textAlign: 'center', marginTop: 14 }}>아직 기록된 활동이 없어요.</p>
  }

  let previousYear = null
  return (
    <div className="growth-log">
      <h4 className="growth-log-title">성장 기록</h4>
      <div className="growth-log-list">
        {sorted.map((log) => {
          const year = formatLogYear(log.endedAtMillis)
          const showYear = year !== previousYear
          previousYear = year
          return (
            <div key={log.id}>
              {showYear && <div className="growth-log-year">{year}</div>}
              <div className="growth-log-row">
                <span>{formatLogDate(log.endedAtMillis)}</span>
                <strong>{log.durationSeconds > 0 ? formatLogDuration(log.durationSeconds) : '—'}</strong>
              </div>
              {log.note && <div className="growth-log-note">{log.note}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
