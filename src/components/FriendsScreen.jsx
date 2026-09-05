import { useEffect, useState } from 'react'
import {
  addLogComment,
  findUserIdByUsername,
  getFriendBackup,
  getLogComments,
  getLogLikes,
  listFriendships,
  removeFriendship,
  respondFriendRequest,
  sendFriendRequest,
  toggleLogLike,
} from '../lib/social'
import { buildFeedItems } from '../lib/feed'
import { formatLogDate, formatLogDuration } from '../data/growth'
import FriendGardenModal from './FriendGardenModal'

export default function FriendsScreen({ userId, username, backup }) {
  const [subTab, setSubTab] = useState('feed')
  const [friendships, setFriendships] = useState([])
  const [friendshipsLoaded, setFriendshipsLoaded] = useState(false)

  const [searchName, setSearchName] = useState('')
  const [searchBusy, setSearchBusy] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')

  const [feedItems, setFeedItems] = useState([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [feedError, setFeedError] = useState('')
  const [likes, setLikes] = useState({})
  const [comments, setComments] = useState({})
  const [openCommentsKey, setOpenCommentsKey] = useState(null)
  const [commentDraft, setCommentDraft] = useState('')

  const [viewFriend, setViewFriend] = useState(null)
  const [viewFriendBackup, setViewFriendBackup] = useState(null)
  const [viewFriendLoading, setViewFriendLoading] = useState(false)
  const [viewFriendError, setViewFriendError] = useState('')

  async function refreshFriendships() {
    try {
      const rows = await listFriendships(userId)
      setFriendships(rows)
    } finally {
      setFriendshipsLoaded(true)
    }
  }

  useEffect(() => {
    refreshFriendships()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!friendshipsLoaded) return
    loadFeed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendshipsLoaded, friendships, backup])

  async function loadFeed() {
    setFeedLoading(true)
    setFeedError('')
    try {
      const accepted = friendships.filter((f) => f.status === 'accepted')
      const friendEntries = []
      let anyFailed = false
      for (const f of accepted) {
        try {
          const friendBackup = await getFriendBackup(f.otherUserId)
          friendEntries.push({ userId: f.otherUserId, username: f.otherUsername, backup: friendBackup, isOwn: false })
        } catch {
          anyFailed = true
        }
      }
      const items = buildFeedItems([
        { userId, username, backup, isOwn: true },
        ...friendEntries,
      ])
      setFeedItems(items)
      if (anyFailed) setFeedError('일부 친구의 업데이트를 불러오지 못했어요.')
      const ownerIds = [...new Set(items.map((i) => i.ownerId))]
      const [likeMap, commentMap] = await Promise.all([getLogLikes(ownerIds), getLogComments(ownerIds)])
      setLikes(likeMap)
      setComments(commentMap)
    } catch {
      setFeedError('피드를 불러오지 못했어요.')
    } finally {
      setFeedLoading(false)
    }
  }

  async function handleSearchSubmit(e) {
    e.preventDefault()
    const target = searchName.trim()
    if (!target) return
    setSearchBusy(true)
    setSearchMessage('')
    try {
      const targetId = await findUserIdByUsername(target)
      if (!targetId) {
        setSearchMessage('해당 아이디를 찾을 수 없어요.')
      } else if (targetId === userId) {
        setSearchMessage('자기 자신에게는 요청을 보낼 수 없어요.')
      } else if (friendships.some((f) => f.otherUserId === targetId)) {
        setSearchMessage('이미 친구이거나 요청이 진행 중이에요.')
      } else {
        await sendFriendRequest(userId, targetId)
        setSearchMessage('친구 요청을 보냈어요.')
        setSearchName('')
        refreshFriendships()
      }
    } catch {
      setSearchMessage('요청을 보내지 못했어요.')
    } finally {
      setSearchBusy(false)
    }
  }

  async function handleRespond(friendshipId) {
    await respondFriendRequest(friendshipId)
    refreshFriendships()
  }

  async function handleRemove(friendshipId) {
    await removeFriendship(friendshipId)
    refreshFriendships()
  }

  async function openFriendGarden(friend) {
    setViewFriend(friend)
    setViewFriendBackup(null)
    setViewFriendError('')
    setViewFriendLoading(true)
    try {
      const friendBackup = await getFriendBackup(friend.otherUserId)
      if (!friendBackup) setViewFriendError('정원을 볼 수 없어요.')
      setViewFriendBackup(friendBackup)
    } catch {
      setViewFriendError('정원을 불러오지 못했어요.')
    } finally {
      setViewFriendLoading(false)
    }
  }

  async function handleToggleLike(item) {
    const key = `${item.ownerId}:${item.logId}`
    await toggleLogLike(item.ownerId, item.logId)
    setLikes((prev) => {
      const set = new Set(prev[key] ?? [])
      if (set.has(userId)) set.delete(userId)
      else set.add(userId)
      return { ...prev, [key]: set }
    })
  }

  async function handlePostComment(item) {
    const text = commentDraft.trim()
    if (!text) return
    const key = `${item.ownerId}:${item.logId}`
    const saved = await addLogComment(item.ownerId, item.logId, text)
    setComments((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), { id: saved.id, commenterId: userId, commenterUsername: username, text, createdAtMillis: saved.createdAtMillis }],
    }))
    setCommentDraft('')
  }

  const incoming = friendships.filter((f) => f.status === 'pending' && f.incoming)
  const outgoing = friendships.filter((f) => f.status === 'pending' && !f.incoming)
  const accepted = friendships.filter((f) => f.status === 'accepted')

  return (
    <div>
      <div className="nav-tabs" style={{ marginBottom: 18 }}>
        <button className={subTab === 'feed' ? 'active' : ''} onClick={() => setSubTab('feed')}>피드</button>
        <button className={subTab === 'manage' ? 'active' : ''} onClick={() => setSubTab('manage')}>친구 관리</button>
      </div>

      {subTab === 'feed' && (
        <div>
          <h2 className="section-title">최근 업데이트</h2>
          {feedLoading && <p className="empty-hint">불러오는 중...</p>}
          {feedError && <p className="empty-hint">{feedError}</p>}
          {!feedLoading && feedItems.length === 0 && (
            <p className="empty-hint">아직 활동이 없어요. 친구를 추가하고 목표에 시간을 투자해보세요.</p>
          )}
          <div className="feed-list">
            {feedItems.map((item) => {
              const key = `${item.ownerId}:${item.logId}`
              const likeSet = likes[key] ?? new Set()
              const liked = likeSet.has(userId)
              const itemComments = comments[key] ?? []
              const commentsOpen = openCommentsKey === key
              return (
                <div className="feed-item" key={key}>
                  <div className="feed-item-head">
                    <strong>{item.isOwn ? '나' : item.ownerUsername}</strong>
                    <span>{formatLogDate(item.endedAtMillis)}</span>
                  </div>
                  <div className="feed-item-body">
                    <span className="feed-skill">{item.skillName}</span>에 <strong>{formatLogDuration(item.durationSeconds)}</strong> 투자했어요
                  </div>
                  <div className="feed-item-actions">
                    <button className={`feed-like-btn${liked ? ' liked' : ''}`} onClick={() => handleToggleLike(item)}>
                      {liked ? '❤️' : '🤍'} {likeSet.size > 0 ? likeSet.size : ''}
                    </button>
                    <button
                      className="feed-comment-btn"
                      onClick={() => setOpenCommentsKey(commentsOpen ? null : key)}
                    >
                      💬 {itemComments.length > 0 ? itemComments.length : '댓글'}
                    </button>
                  </div>
                  {commentsOpen && (
                    <div className="feed-comments">
                      {itemComments.map((c) => (
                        <div className="feed-comment-row" key={c.id}>
                          <strong>{c.commenterId === userId ? '나' : c.commenterUsername}</strong> {c.text}
                        </div>
                      ))}
                      <form
                        className="feed-comment-form"
                        onSubmit={(e) => {
                          e.preventDefault()
                          handlePostComment(item)
                        }}
                      >
                        <input
                          value={commentDraft}
                          onChange={(e) => setCommentDraft(e.target.value)}
                          placeholder="댓글 남기기"
                          maxLength={500}
                        />
                        <button type="submit">등록</button>
                      </form>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {subTab === 'manage' && (
        <div>
          <h2 className="section-title">친구 찾기</h2>
          <form className="friend-search-form" onSubmit={handleSearchSubmit}>
            <input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="친구 아이디 입력"
              maxLength={24}
            />
            <button type="submit" disabled={searchBusy}>요청 보내기</button>
          </form>
          {searchMessage && <p className="empty-hint">{searchMessage}</p>}

          {incoming.length > 0 && (
            <>
              <h2 className="section-title" style={{ marginTop: 24 }}>받은 요청</h2>
              <div className="friend-list">
                {incoming.map((f) => (
                  <div className="friend-row" key={f.id}>
                    <span>{f.otherUsername}</span>
                    <div className="friend-row-actions">
                      <button className="goal-reveal-btn" onClick={() => handleRespond(f.id)}>수락</button>
                      <button className="feed-comment-btn" onClick={() => handleRemove(f.id)}>거절</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {outgoing.length > 0 && (
            <>
              <h2 className="section-title" style={{ marginTop: 24 }}>보낸 요청</h2>
              <div className="friend-list">
                {outgoing.map((f) => (
                  <div className="friend-row" key={f.id}>
                    <span>{f.otherUsername}</span>
                    <div className="friend-row-actions">
                      <button className="feed-comment-btn" onClick={() => handleRemove(f.id)}>취소</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <h2 className="section-title" style={{ marginTop: 24 }}>친구 ({accepted.length})</h2>
          {accepted.length === 0 && <p className="empty-hint">아직 친구가 없어요.</p>}
          <div className="friend-list">
            {accepted.map((f) => (
              <div className="friend-row" key={f.id}>
                <span>{f.otherUsername}</span>
                <div className="friend-row-actions">
                  <button className="goal-log-link" onClick={() => openFriendGarden(f)}>정원 보기</button>
                  <button className="feed-comment-btn" onClick={() => handleRemove(f.id)}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <FriendGardenModal
        username={viewFriend?.otherUsername ?? null}
        backup={viewFriendBackup}
        loading={viewFriendLoading}
        error={viewFriendError}
        onClose={() => setViewFriend(null)}
      />
    </div>
  )
}
