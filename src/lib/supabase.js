import { createClient } from '@supabase/supabase-js'

// Same project the Android app talks to (AppConfig.kt) so accounts and
// garden/goal data stay in sync between mobile and web.
const SUPABASE_URL = 'https://nqlvbbjglpsqwqcuczel.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_a1MhHJtqxyChsVHnoRYmGA_Xo6mlKLD'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Mirrors SupabaseCloud.kt's normalizedUsername/usernameEmail exactly so the
// same username + password logs into the same account on mobile and web.
export function normalizedUsername(username) {
  const normalized = username.trim().toLowerCase()
  return /^[a-z0-9._-]{3,24}$/.test(normalized) ? normalized : null
}

export function usernameEmail(username) {
  return `${username}@users.lifeforge.app`
}

export function validateCredentials(username, password) {
  const normalized = normalizedUsername(username)
  if (!normalized) throw new Error('아이디는 3~24자의 영문, 숫자, ., -, _ 만 사용할 수 있어요.')
  if (password.length < 6) throw new Error('비밀번호는 6자 이상이어야 해요.')
  return normalized
}
