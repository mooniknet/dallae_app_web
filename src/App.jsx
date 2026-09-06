import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { getSession, onAuthChange, signOut } from './lib/auth'
import { downloadBackup, uploadBackup } from './lib/backup'
import { addGoal, createDefaultBackup, mergeGrowthRecords, revealFlower } from './data/model'
import { nextFlowerId } from './data/flowers'
import { ensureProfile } from './lib/social'
import AuthScreen from './components/AuthScreen'
import GoalsScreen from './components/GoalsScreen'
import FriendsScreen from './components/FriendsScreen'
import { loadSharedGrowthState, startSharedTimer, stopSharedTimer, subscribeToSharedGrowth } from './lib/realtimeGrowth'
import { formatClock } from './data/growth'

function usernameFromSession(session) {
  return session?.user?.user_metadata?.username || session?.user?.email?.split('@')[0] || ''
}

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading, null = signed out
  const [backup, setBackup] = useState(null)
  const [tab, setTab] = useState('goals')
  const [syncStatus, setSyncStatus] = useState('idle')
  const [runningTimers, setRunningTimers] = useState({})
  const [activeTimer, setActiveTimer] = useState(null)
  const [now, setNow] = useState(Date.now())
  const backupReady = backup !== null

  useEffect(() => {
    getSession().then(setSession)
    return onAuthChange(setSession)
  }, [])

  useEffect(() => {
    if (!session) {
      setBackup(null)
      return
    }
    let cancelled = false
    ;(async () => {
      setSyncStatus('saving')
      try {
        const remote = await downloadBackup(session.user.id)
        if (cancelled) return
        if (remote) {
          setBackup(remote)
        } else {
          const fresh = createDefaultBackup()
          setBackup(fresh)
          await uploadBackup(session.user.id, fresh)
        }
        setSyncStatus('synced')
        ensureProfile(session.user.id, usernameFromSession(session)).catch(() => {})
      } catch {
        if (!cancelled) setSyncStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session])

  const refreshSharedGrowth = useCallback(async () => {
    if (!session) return
    const shared = await loadSharedGrowthState(session.user.id)
    setActiveTimer(shared.activeTimer)
    setRunningTimers(shared.activeTimer ? { [shared.activeTimer.skillId]: shared.activeTimer.startedAtMillis } : {})
    setBackup((current) => current ? mergeGrowthRecords(current, shared.records) : current)
  }, [session])

  useEffect(() => {
    if (!session || !backupReady) return
    let cancelled = false
    const refresh = () => refreshSharedGrowth().catch(() => {
      if (!cancelled) setSyncStatus('error')
    })
    refresh()
    const unsubscribe = subscribeToSharedGrowth(session.user.id, refresh)
    const recover = setInterval(refresh, 30000)
    const onVisible = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      unsubscribe()
      clearInterval(recover)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [session, backupReady, refreshSharedGrowth])

  useEffect(() => {
    if (Object.keys(runningTimers).length === 0) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [runningTimers])

  useEffect(() => {
    if (!activeTimer) {
      document.title = '달래 — Dallae'
      return
    }
    const skillName = backup?.skills.find((s) => s.id === activeTimer.skillId)?.name
    const seconds = (now - activeTimer.startedAtMillis) / 1000
    document.title = `⏱ ${formatClock(seconds)} · ${skillName ?? '달래'}`
  }, [activeTimer, now, backup])

  async function mutate(fn) {
    if (!backup || !session) return
    const next = fn(backup)
    setBackup(next)
    setSyncStatus('saving')
    try {
      await uploadBackup(session.user.id, next)
      setSyncStatus('synced')
    } catch {
      setSyncStatus('error')
    }
  }

  async function handleStartTimer(skillId) {
    try {
      setSyncStatus('saving')
      const timer = await startSharedTimer(skillId)
      setActiveTimer(timer)
      setRunningTimers({ [timer.skillId]: timer.startedAtMillis })
      setSyncStatus('synced')
    } catch {
      await refreshSharedGrowth().catch(() => {})
      setSyncStatus('error')
      window.alert('다른 기기에서 타이머가 이미 실행 중일 수 있어요.')
    }
  }

  async function handleStopTimer(skillId) {
    if (!activeTimer || activeTimer.skillId !== skillId) return null
    try {
      setSyncStatus('saving')
      const record = await stopSharedTimer(activeTimer.eventId)
      setActiveTimer(null)
      setRunningTimers({})
      setBackup((current) => current ? mergeGrowthRecords(current, [record]) : current)
      setSyncStatus('synced')
      return record
    } catch {
      setSyncStatus('error')
      window.alert('타이머를 정지하지 못했어요. 연결을 확인해주세요.')
      return null
    }
  }

  function handleAddGoal(name) {
    mutate((b) => addGoal(b, name))
  }

  async function handleReveal(skillId) {
    // If the timer is still running when the flower is revealed, commit its
    // elapsed time first so that final stretch isn't silently dropped.
    let base = backup
    if (runningTimers[skillId]) {
      const record = await handleStopTimer(skillId)
      if (!record) return
      base = mergeGrowthRecords(base, [record])
    }
    const flowerId = nextFlowerId(base.gardenPlants)
    if (!flowerId) return
    const next = revealFlower(base, skillId, flowerId)
    setBackup(next)
    setSyncStatus('saving')
    try {
      await uploadBackup(session.user.id, next)
      setSyncStatus('synced')
    } catch {
      setSyncStatus('error')
    }
  }

  async function handleSignOut() {
    if (activeTimer) {
      await handleStopTimer(activeTimer.skillId)
    }
    await signOut()
  }

  const syncLabel = useMemo(
    () => ({ idle: '', saving: '저장 중...', synced: '동기화됨', error: '동기화 실패' }[syncStatus]),
    [syncStatus]
  )

  const activeTimerSkillName = activeTimer
    ? backup?.skills.find((s) => s.id === activeTimer.skillId)?.name
    : null
  const activeTimerSeconds = activeTimer ? (now - activeTimer.startedAtMillis) / 1000 : 0

  if (session === undefined) return null
  if (!session) return <AuthScreen />
  if (!backup) return null

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title">🌱 달래</div>
        <nav className="nav-tabs">
          <button className={tab === 'goals' ? 'active' : ''} onClick={() => setTab('goals')}>
            목표
          </button>
          <button className={tab === 'friends' ? 'active' : ''} onClick={() => setTab('friends')}>
            친구
          </button>
        </nav>
        <div className="header-right">
          {activeTimer && (
            <span className="header-timer-badge">
              ⏱ {activeTimerSkillName ?? '타이머'} {formatClock(activeTimerSeconds)}
            </span>
          )}
          {syncLabel && <span className={`sync-badge ${syncStatus}`}>{syncLabel}</span>}
          <button className="signout-btn" onClick={handleSignOut}>
            로그아웃
          </button>
        </div>
      </header>
      <main className="app-main">
        {tab === 'goals' && (
          <GoalsScreen
            backup={backup}
            now={now}
            runningTimers={runningTimers}
            onStartTimer={handleStartTimer}
            onStopTimer={handleStopTimer}
            onAddGoal={handleAddGoal}
            onReveal={handleReveal}
          />
        )}
        {tab === 'friends' && (
          <FriendsScreen userId={session.user.id} username={usernameFromSession(session)} backup={backup} />
        )}
      </main>
    </div>
  )
}
