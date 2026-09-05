import { supabase } from './supabase'

// Reads/writes the same `lifeforge_backups` row the Android app syncs to
// (one JSON blob per user_id). We always round-trip the *full* object so
// fields this web app doesn't touch (nested skill maps, links, messages,
// mobile-only settings) survive untouched between mobile and web edits.
export async function downloadBackup(userId) {
  const { data, error } = await supabase
    .from('lifeforge_backups')
    .select('payload')
    .eq('user_id', userId)
    .limit(1)
  if (error) throw error
  return data.length ? data[0].payload : null
}

export async function uploadBackup(userId, backup) {
  const payload = { ...backup, exportedAtMillis: Date.now() }
  const { error } = await supabase
    .from('lifeforge_backups')
    .upsert({ user_id: userId, payload }, { onConflict: 'user_id' })
  if (error) throw error
  return payload
}
