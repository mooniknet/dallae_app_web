import { supabase, usernameEmail, validateCredentials } from './supabase'

export async function signUp(username, password) {
  const normalized = validateCredentials(username, password)
  const { data, error } = await supabase.auth.signUp({
    email: usernameEmail(normalized),
    password,
    options: { data: { username: normalized } },
  })
  if (error) throw error
  return data.session
}

export async function signIn(username, password) {
  const normalized = validateCredentials(username, password)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameEmail(normalized),
    password,
  })
  if (error) throw error
  return data.session
}

export async function signOut() {
  await supabase.auth.signOut()
}

export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}
