import { supabase } from './supabase'

const DEVICE_KEY = 'dallae_web_device_id'

function browserDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

function mapRecord(row) {
  return {
    eventId: row.event_id,
    id: Number(row.log_id),
    skillId: row.skill_id,
    startedAtMillis: Date.parse(row.started_at),
    endedAtMillis: Date.parse(row.ended_at),
    durationSeconds: Number(row.duration_seconds),
    entryType: row.entry_type || 'TIMER',
    contentTitle: '',
    contentUrl: '',
    note: row.note || '',
    contentKind: 'CONTENT',
    deleted: row.deleted_at != null,
  }
}

function mapActiveTimer(row) {
  if (!row) return null
  return {
    eventId: row.event_id,
    skillId: row.skill_id,
    startedAtMillis: Date.parse(row.started_at),
    sourceClient: row.source_client,
    sourceDeviceId: row.source_device_id,
  }
}

export async function loadSharedGrowthState(userId) {
  const [timerResult, recordsResult] = await Promise.all([
    supabase.from('dallae_active_timers').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('dallae_growth_records').select('*').eq('user_id', userId).order('created_at'),
  ])
  if (timerResult.error) throw timerResult.error
  if (recordsResult.error) throw recordsResult.error
  return {
    activeTimer: mapActiveTimer(timerResult.data),
    records: (recordsResult.data || []).map(mapRecord),
  }
}

export async function startSharedTimer(skillId) {
  const { data, error } = await supabase.rpc('start_dallae_timer', {
    p_skill_id: skillId,
    p_source_client: 'web',
    p_source_device_id: browserDeviceId(),
  })
  if (error) throw error
  return mapActiveTimer(data)
}

export async function stopSharedTimer(eventId, note = '') {
  const { data, error } = await supabase.rpc('stop_dallae_timer', {
    p_event_id: eventId,
    p_note: note,
  })
  if (error) throw error
  return mapRecord(data)
}

export function subscribeToSharedGrowth(userId, onChange) {
  const channel = supabase
    .channel(`dallae:${userId}`)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'dallae_active_timers', filter: `user_id=eq.${userId}`,
    }, onChange)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'dallae_growth_records', filter: `user_id=eq.${userId}`,
    }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}
