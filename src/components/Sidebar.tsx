import { useState } from 'react'
import type { Chat, Profile } from '../types'
import { formatListTime, formatPhone, stateLabel } from '../format/display'
import { errorText, explainError } from '../errors'
import { BackIcon } from './icons'
import Avatar from './Avatar'

interface SidebarProps {
  chats: Chat[]
  activeId: string | null
  instanceId: string
  instanceState: string
  profile: Profile | null
  accountNote: string
  onSelect: (id: string) => void
  onCreate: (phone: string) => Promise<void>
  onLogout: () => void
}

export default function Sidebar({
  chats,
  activeId,
  instanceId,
  instanceState,
  profile,
  accountNote,
  onSelect,
  onCreate,
  onLogout,
}: SidebarProps) {
  const [creating, setCreating] = useState(false)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submitNew(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onCreate(phone)
      setPhone('')
      setCreating(false)
    } catch (err) {
      setError(explainError(errorText(err)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="sidebar">
      <div className="side-top">
        {creating ? (
          <button type="button" className="icon-btn" onClick={() => setCreating(false)} aria-label="Назад">
            <BackIcon />
          </button>
        ) : (
          <h2 className="side-title">Чаты</h2>
        )}
        {creating ? (
          <h2 className="side-title">Новый чат</h2>
        ) : (
          <button type="button" className="text-btn" onClick={() => { setCreating(true); setError('') }}>
            Новый чат
          </button>
        )}
      </div>

      {!creating && (
        <div className="me">
          <Avatar
            title={profile?.phone ? formatPhone(profile.phone) : instanceId}
            seed={profile?.phone || instanceId}
            src={profile?.avatar}
            size={42}
          />
          <div className="me-text">
            <strong>{profile?.phone ? formatPhone(profile.phone) : 'Ваш WhatsApp'}</strong>
            <span>
              {accountNote
                || (profile == null
                  ? 'проверяю аккаунт...'
                  : (instanceState ? stateLabel(instanceState) : 'профиль недоступен'))}
            </span>
          </div>
        </div>
      )}

      {creating ? (
        <form className="new-chat" onSubmit={submitNew}>
          <p>Номер телефона получателя, в международном формате.</p>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="79991234567"
            inputMode="tel"
            autoFocus
            aria-label="Номер телефона"
          />
          {error && <p className="form-error">{error}</p>}
          <button className="primary" type="submit" disabled={loading || !phone.trim()}>
            {loading ? 'Ищу в WhatsApp...' : 'Создать чат'}
          </button>
        </form>
      ) : (
        <div className="chat-list">
          {chats.length === 0 && (
            <p className="empty-list">Пока пусто. Создайте чат по номеру телефона.</p>
          )}
          {chats.map((chat) => {
            const last = chat.messages[chat.messages.length - 1]
            const preview = last ? `${last.out ? 'Вы: ' : ''}${last.text}` : 'Нет сообщений'
            return (
              <button
                key={chat.id}
                type="button"
                className={chat.id === activeId ? 'chat-row active' : 'chat-row'}
                onClick={() => onSelect(chat.id)}
              >
                <Avatar title={chat.title} seed={chat.id} />
                <span className="chat-body">
                  <span className="chat-top">
                    <span className="chat-name">{chat.title}</span>
                    <span className="chat-time">{formatListTime(last?.time || chat.updatedAt)}</span>
                  </span>
                  <span className="chat-bottom">
                    <span className="chat-preview">{preview}</span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      <footer className="side-foot">
        <span>{instanceId}</span>
        <button type="button" className="linkish" onClick={onLogout}>Выйти</button>
      </footer>
    </aside>
  )
}
