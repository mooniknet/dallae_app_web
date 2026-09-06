import { useState } from 'react'
import { signIn, signUp } from '../lib/auth'

export default function AuthScreen() {
  const [mode, setMode] = useState('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signin') await signIn(username, password)
      else await signUp(username, password)
    } catch (err) {
      setError(err.message ?? String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>달래</h1>
        <p className="subtitle">
          {mode === 'signin' ? '기존 계정(모바일 앱과 동일)으로 로그인하세요.' : '새 계정을 만드세요.'}
        </p>
        <div className="web-scope-note">
          웹 버전은 목표 타이머 기능을 중심으로 제공돼요. 정원 꾸미기 등 다른 기능은 앱에 비해 제한적이에요.
        </div>
        <form onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>아이디</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="영문/숫자 3~24자"
              autoComplete="username"
              required
            />
          </label>
          <label className="auth-field">
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? '처리 중...' : mode === 'signin' ? '로그인' : '회원가입'}
          </button>
        </form>
        <div className="auth-toggle">
          {mode === 'signin' ? (
            <>
              계정이 없나요? <button onClick={() => setMode('signup')}>회원가입</button>
            </>
          ) : (
            <>
              이미 계정이 있나요? <button onClick={() => setMode('signin')}>로그인</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
