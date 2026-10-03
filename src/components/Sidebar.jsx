import { useState } from 'react'
import { formatListTime, stateLabel } from '../format'
import { explainError } from '../errors'
import { BackIcon, PencilIcon, SearchIcon } from '../icons'
import Avatar from './Avatar'

export default function Sidebar({
  chats,
  activeId,
  instanceId,
  instanceState,
  onSelect,
  onCreate,
  onLogout,
}) {
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const needle = query.trim().toLowerCase()
  const visible = chats.filter((chat) => {
    if (!needle) return true
    const digits = needle.replace(/\D/g, '')
    return chat.title.toLowerCase().includes(needle)
      || (digits && String(chat.phone || '').includes(digits))
  })

  async function submitNew(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onCreate(phone)
      setPhone('')
      setCreating(false)
    } catch (err) {
      setError(explainError(err.message))
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
          <div className="search">
            <SearchIcon />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск"
              aria-label="Поиск"
            />
          </div>
        )}
        {!creating && (
          <button type="button" className="icon-btn" onClick={() => { setCreating(true); setError('') }} aria-label="Новый чат">
            <PencilIcon />
          </button>
        )}
        {creating && <h2 className="side-title">Новый чат</h2>}
      </div>

      {creating ? (
        <form className="new-chat" onSubmit={submitNew}>
          <p>
            Номер в международном формате. Сначала найдём chatId через CheckAccount,
            потом по нему пойдут сообщения.
          </p>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="79991234567"
            inputMode="tel"
            autoFocus
            aria-label="Номер телефона"
          />
          <small>Можно и @username, если номера нет.</small>
          {error && <p className="form-error">{error}</p>}
          <button className="primary" type="submit" disabled={loading || !phone.trim()}>
            {loading ? 'Ищу в Telegram...' : 'Создать чат'}
          </button>
        </form>
      ) : (
        <div className="chat-list">
          {visible.length === 0 && (
            <p className="empty-list">
              {chats.length === 0
                ? 'Пока пусто. Нажмите карандаш и введите номер.'
                : 'Ничего не нашлось.'}
            </p>
          )}
          {visible.map((chat) => {
            const last = chat.messages[chat.messages.length - 1]
            const preview = last ? `${last.out ? 'Вы: ' : ''}${last.text}` : 'Нет сообщений'
            return (
              <button
                key={chat.id}
                type="button"
                className={[
                  'chat-row',
                  chat.id === activeId ? 'active' : '',
                  chat.unread ? 'unread' : '',
                ].filter(Boolean).join(' ')}
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
                    {chat.unread > 0 && <span className="badge">{chat.unread}</span>}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      <footer className="side-foot">
        <span>
          {instanceId}
          {instanceState ? ` · ${stateLabel(instanceState)}` : ''}
        </span>
        <button type="button" className="linkish" onClick={onLogout}>Выйти</button>
      </footer>
    </aside>
  )
}
