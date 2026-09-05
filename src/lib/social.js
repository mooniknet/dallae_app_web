import { supabase } from './supabase'

export async function ensureProfile(userId, username) {
  const { error } = await supabase
    .from('lifeforge_profiles')
    .upsert({ user_id: userId, username }, { onConflict: 'user_id' })
  if (error) throw error
}

export async function findUserIdByUsername(username) {
  const normalized = username.trim().toLowerCase()
  const { data, error } = await supabase
    .from('lifeforge_profiles')
    .select('user_id')
    .eq('username', normalized)
    .limit(1)
  if (error) throw error
  return data.length ? data[0].user_id : null
}

export async function sendFriendRequest(myUserId, addresseeId) {
  const { error } = await supabase
    .from('lifeforge_friendships')
    .insert({ requester_id: myUserId, addressee_id: addresseeId, status: 'pending' })
  if (error) throw error
}

export async function respondFriendRequest(friendshipId) {
  const { error } = await supabase.rpc('respond_friend_request', { p_friendship_id: friendshipId })
  if (error) throw error
}

export async function removeFriendship(friendshipId) {
  const { error } = await supabase.rpc('remove_friendship', { p_friendship_id: friendshipId })
  if (error) throw error
}

async function usernamesFor(userIds) {
  if (userIds.length === 0) return {}
  const { data, error } = await supabase
    .from('lifeforge_profiles')
    .select('user_id, username')
    .in('user_id', userIds)
  if (error) throw error
  return Object.fromEntries(data.map((r) => [r.user_id, r.username]))
}

export async function listFriendships(myUserId) {
  const { data, error } = await supabase
    .from('lifeforge_friendships')
    .select('id, requester_id, addressee_id, status')
    .or(`requester_id.eq.${myUserId},addressee_id.eq.${myUserId}`)
    .order('id', { ascending: false })
  if (error) throw error
  const otherIds = [...new Set(data.map((r) => (r.requester_id === myUserId ? r.addressee_id : r.requester_id)))]
  const usernames = await usernamesFor(otherIds)
  return data.map((r) => {
    const otherId = r.requester_id === myUserId ? r.addressee_id : r.requester_id
    return {
      id: r.id,
      otherUserId: otherId,
      otherUsername: usernames[otherId] ?? otherId,
      status: r.status,
      incoming: r.addressee_id === myUserId,
    }
  })
}

export async function getFriendBackup(friendUserId) {
  const { data, error } = await supabase.rpc('get_friend_backup', { p_friend_id: friendUserId })
  if (error) throw error
  return data ?? null
}

export async function getLogLikes(ownerIds) {
  if (ownerIds.length === 0) return {}
  const { data, error } = await supabase
    .from('lifeforge_log_likes')
    .select('log_owner_id, log_id, liker_id')
    .in('log_owner_id', ownerIds)
  if (error) throw error
  const grouped = {}
  for (const row of data) {
    const key = `${row.log_owner_id}:${row.log_id}`
    if (!grouped[key]) grouped[key] = new Set()
    grouped[key].add(row.liker_id)
  }
  return grouped
}

export async function toggleLogLike(logOwnerId, logId) {
  const { data, error } = await supabase.rpc('toggle_log_like', { p_log_owner_id: logOwnerId, p_log_id: logId })
  if (error) throw error
  return data
}

export async function getLogComments(ownerIds) {
  if (ownerIds.length === 0) return {}
  const { data, error } = await supabase
    .from('lifeforge_log_comments')
    .select('id, log_owner_id, log_id, commenter_id, text, created_at')
    .in('log_owner_id', ownerIds)
    .order('created_at', { ascending: true })
  if (error) throw error
  const commenterIds = [...new Set(data.map((r) => r.commenter_id))]
  const usernames = await usernamesFor(commenterIds)
  const grouped = {}
  for (const row of data) {
    const key = `${row.log_owner_id}:${row.log_id}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push({
      id: row.id,
      commenterId: row.commenter_id,
      commenterUsername: usernames[row.commenter_id] ?? row.commenter_id,
      text: row.text,
      createdAtMillis: new Date(row.created_at).getTime(),
    })
  }
  return grouped
}

export async function addLogComment(logOwnerId, logId, text) {
  const { data, error } = await supabase.rpc('add_log_comment', {
    p_log_owner_id: logOwnerId,
    p_log_id: logId,
    p_text: text,
  })
  if (error) throw error
  return data
}

export async function deleteLogComment(commentId) {
  const { error } = await supabase.rpc('delete_log_comment', { p_comment_id: commentId })
  if (error) throw error
}
