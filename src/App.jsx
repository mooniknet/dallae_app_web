import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { getSession, onAuthChange, signOut } from './lib/auth'
import { downloadBackup, uploadBackup } from './lib/backup'
import { addGoal, addInvestedSeconds, createDefaultBackup, movePlant, revealFlower } from './data/model'
import { nextFlowerId } from './data/flowers'
import AuthScreen from './components/AuthScreen'
import GoalsScreen from './components/GoalsScreen'
import GardenScreen from './components/GardenScreen'
import FlowerBookScreen from './components/FlowerBookScreen'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading, null = signed out
  const [backup, setBackup] = useState(null)
  const [tab, setTab] = useState('goals')
  const [syncStatus, setSyncStatus] = useState('idle')
  const [runningTimers, setRunningTimers] = useState({})
  const [now, setNow] = useState(Date.now())

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
      } catch {
        if (!cancelled) setSyncStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session])

  useEffect(() => {
    if (Object.keys(runningTimers).length === 0) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [runningTimers])

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

  function handleStartTimer(skillId) {
    setRunningTimers((prev) => ({ ...prev, [skillId]: Date.now() }))
  }

  function handleStopTimer(skillId) {
    const startedAt = runningTimers[skillId]
    if (!startedAt) return
    setRunningTimers((prev) => {
      const next = { ...prev }
      delete next[skillId]
      return next
    })
    const elapsed = Math.round((Date.now() - startedAt) / 1000)
    mutate((b) => addInvestedSeconds(b, skillId, elapsed))
  }

  function handleAddGoal(name) {
    mutate((b) => addGoal(b, name))
  }

  function handleReveal(skillId) {
    mutate((b) => {
      const flowerId = nextFlowerId(b.gardenPlants)
      if (!flowerId) return b
      return revealFlower(b, skillId, flowerId)
    })
  }

  function handleMovePlant(skillId, x, y) {
    mutate((b) => movePlant(b, skillId, x, y))
  }

  const syncLabel = useMemo(
    () => ({ idle: '', saving: '저장 중...', synced: '동기화됨', error: '동기화 실패' }[syncStatus]),
    [syncStatus]
  )

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
          <button className={tab === 'garden' ? 'active' : ''} onClick={() => setTab('garden')}>
            정원
          </button>
          <button className={tab === 'book' ? 'active' : ''} onClick={() => setTab('book')}>
            꽃 도감
          </button>
        </nav>
        <div className="header-right">
          {syncLabel && <span className={`sync-badge ${syncStatus}`}>{syncLabel}</span>}
          <button className="signout-btn" onClick={signOut}>
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
        {tab === 'garden' && (
          <GardenScreen
            backup={backup}
            now={now}
            runningTimers={runningTimers}
            onStartTimer={handleStartTimer}
            onStopTimer={handleStopTimer}
            onReveal={handleReveal}
            onMovePlant={handleMovePlant}
          />
        )}
        {tab === 'book' && <FlowerBookScreen backup={backup} />}
      </main>
    </div>
  )
}
