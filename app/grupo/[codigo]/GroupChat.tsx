'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { display_name: string } | null
}

interface GroupChatProps {
  groupId: string
  currentUserId: string
  initialMessages: Message[]
}

const AVATAR_COLORS = ['#001F5B', '#00C46A', '#FFBA00', '#FF5C5C', '#7C3AED', '#0EA5E9', '#F97316']

function avatarColor(userId: string) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function formatTime(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'ahora'
  if (diffMin < 60) return `${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  return d.toLocaleDateString('es-PA', { day: 'numeric', month: 'short' })
}

export default function GroupChat({ groupId, currentUserId, initialMessages }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          // Skip if we already have it (optimistic)
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev
            return prev
          })
          // Fetch with profile join
          const { data } = await supabase
            .from('group_messages')
            .select('*, profiles(display_name)')
            .eq('id', payload.new.id)
            .single()
          if (data) {
            setMessages(prev => {
              if (prev.some(m => m.id === data.id)) return prev
              return [...prev, data as Message]
            })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupId]) // eslint-disable-line

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    await supabase.from('group_messages').insert({
      group_id: groupId,
      user_id: currentUserId,
      content: text,
    })
    setSending(false)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, rgba(0,196,106,.5), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C46A', boxShadow: '0 0 6px #00C46A' }} />
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13,
            color: 'var(--bf-text-2)', letterSpacing: '.1em', textTransform: 'uppercase',
          }}>
            Chat del grupo
          </p>
        </div>
        <div style={{ flex: 1, height: 2, background: 'linear-gradient(270deg, rgba(0,196,106,.5), transparent)' }} />
      </div>

      {/* Chat box */}
      <div style={{
        background: 'var(--bf-card)', borderRadius: 20,
        border: '1.5px solid var(--bf-border)',
        overflow: 'hidden',
        boxShadow: 'var(--bf-shadow-sm)',
      }}>
        {/* Messages list */}
        <div
          ref={listRef}
          style={{
            height: 280, overflowY: 'auto',
            padding: '14px 14px 8px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}
        >
          {messages.length === 0 ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8, opacity: .6,
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M6 6h20a2 2 0 012 2v12a2 2 0 01-2 2H10l-6 4V8a2 2 0 012-2z"
                  stroke="var(--bf-text-3)" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--bf-text-2)', textAlign: 'center' }}>
                Nadie ha dicho nada todavía
              </p>
              <p style={{ fontSize: 12, color: 'var(--bf-text-3)', textAlign: 'center' }}>
                Sé el primero en soltar el trash talk
              </p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.user_id === currentUserId
              const prevMsg = messages[i - 1]
              const sameAuthor = prevMsg?.user_id === msg.user_id
              const initial = (msg.profiles?.display_name ?? '?')[0].toUpperCase()
              const color = avatarColor(msg.user_id)
              const name = msg.profiles?.display_name ?? 'Anónimo'

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'flex-end',
                    flexDirection: isMe ? 'row-reverse' : 'row',
                    marginTop: sameAuthor ? -4 : 0,
                  }}
                >
                  {/* Avatar — only show for first in a sequence */}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: sameAuthor ? 'transparent' : color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11, color: '#fff',
                  }}>
                    {!sameAuthor && initial}
                  </div>

                  <div style={{
                    maxWidth: '74%',
                    display: 'flex', flexDirection: 'column',
                    gap: 2,
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                  }}>
                    {/* Name (only for first in sequence, not me) */}
                    {!isMe && !sameAuthor && (
                      <p style={{
                        fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700,
                        color: 'var(--bf-text-3)', paddingLeft: 6,
                      }}>
                        {name}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                      <div style={{
                        background: isMe
                          ? 'linear-gradient(135deg, #001F5B 0%, #003087 100%)'
                          : '#F0F2F8',
                        borderRadius: isMe
                          ? (sameAuthor ? '14px 4px 14px 14px' : '14px 4px 14px 14px')
                          : (sameAuthor ? '4px 14px 14px 14px' : '4px 14px 14px 14px'),
                        padding: '8px 12px',
                      }}>
                        <p style={{
                          fontSize: 14, lineHeight: 1.4, wordBreak: 'break-word',
                          color: isMe ? '#fff' : 'var(--bf-text)',
                        }}>
                          {msg.content}
                        </p>
                      </div>
                      <p style={{
                        fontSize: 9, color: 'var(--bf-text-3)',
                        paddingBottom: 2, whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          borderTop: '1px solid var(--bf-divider)',
          padding: '10px 12px',
          display: 'flex', gap: 8, alignItems: 'center',
          background: '#FAFBFD',
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Diles algo..."
            maxLength={300}
            style={{
              flex: 1, border: '1.5px solid var(--bf-border)', borderRadius: 20,
              padding: '9px 14px', fontSize: 14, fontFamily: 'var(--font-body)',
              color: 'var(--bf-text)', background: '#fff', outline: 'none',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{
              width: 38, height: 38, borderRadius: '50%', border: 'none',
              background: input.trim() ? 'var(--bf-green)' : 'var(--bf-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0,
              transition: 'background .15s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 2L1 7l5 3 2 5 2-5 4-8z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
