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
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000)
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
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
        table: 'group_messages', filter: `group_id=eq.${groupId}`,
      }, async (payload) => {
        const { data } = await supabase
          .from('group_messages').select('*, profiles(display_name)')
          .eq('id', payload.new.id).single()
        if (data) setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data as Message])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [groupId]) // eslint-disable-line

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    await supabase.from('group_messages').insert({ group_id: groupId, user_id: currentUserId, content: text })
    setSending(false)
  }

  return (
    <div>
      {/* ── Header — Sala de Pique */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(0,196,106,.35), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bf-green)', boxShadow: '0 0 8px var(--bf-green)' }} />
          <p style={{ fontFamily: 'var(--font-score)', fontSize: 14, color: 'var(--bf-green)', letterSpacing: '.16em' }}>
            SALA DE PIQUE
          </p>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bf-green)', boxShadow: '0 0 8px var(--bf-green)' }} />
        </div>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, rgba(0,196,106,.35), transparent)' }} />
      </div>

      {/* ── Messages — open flow, no box */}
      <div>
        {/* Messages */}
        <div style={{
          height: 260, overflowY: 'auto',
          padding: '4px 2px 10px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: .5 }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 4h20a2 2 0 012 2v11a2 2 0 01-2 2H8l-6 4V6a2 2 0 012-2z" stroke="var(--bf-text-3)" strokeWidth="1.6" strokeLinejoin="round"/>
              </svg>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--bf-text-2)', textAlign: 'center' }}>
                Nadie ha dicho nada todavía
              </p>
              <p style={{ fontSize: 11, color: 'var(--bf-text-3)', textAlign: 'center' }}>Sé el primero en soltar el trash talk</p>
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
                <div key={msg.id} style={{
                  display: 'flex', gap: 7, alignItems: 'flex-end',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  marginTop: sameAuthor ? -2 : 0,
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                    background: sameAuthor ? 'transparent' : color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 10, color: '#fff',
                  }}>
                    {!sameAuthor && initial}
                  </div>

                  <div style={{ maxWidth: '76%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    {!isMe && !sameAuthor && (
                      <p style={{ fontSize: 9, fontFamily: 'var(--font-display)', fontWeight: 700, color: color, paddingLeft: 4, letterSpacing: '.04em', opacity: .85 }}>
                        {name.toUpperCase()}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                      <div className={isMe ? 'chat-bubble-me' : 'chat-bubble-other'} style={{ padding: '7px 11px' }}>
                        <p style={{ fontSize: 13, lineHeight: 1.45, wordBreak: 'break-word', color: '#fff' }}>
                          {msg.content}
                        </p>
                      </div>
                      <p style={{ fontSize: 9, color: 'var(--bf-text-3)', paddingBottom: 2, whiteSpace: 'nowrap', flexShrink: 0 }}>
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

        {/* Input area — borderless, flows over app bg */}
        <div style={{
          borderTop: '1px solid rgba(0,196,106,.12)',
          paddingTop: 10,
          display: 'flex', gap: 7, alignItems: 'center',
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Diles algo..."
            maxLength={300}
            className="chat-input-dark"
            style={{ flex: 1, padding: '9px 13px', fontSize: 13, fontFamily: 'var(--font-body)' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{
              width: 36, height: 36, borderRadius: 8, border: 'none', flexShrink: 0,
              background: input.trim() ? 'var(--bf-green)' : 'rgba(255,255,255,.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default',
              transition: 'background .15s, box-shadow .15s',
              boxShadow: input.trim() ? '0 0 12px rgba(0,196,106,.4)' : 'none',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M13 1.5L1 6.5l5 2.5 2 5 2-5 3-7.5z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
