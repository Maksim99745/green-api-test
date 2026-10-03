import { useEffect, useRef, useState } from 'react'
import { dayLabel, formatClock, formatPhone } from '../format'
import { BackIcon, CheckIcon, PlaneIcon } from '../icons'
import Avatar from './Avatar'

export default function Dialog({ chat, pollError, onSend, onRetry, onBack }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setText('')
    setError('')
    inputRef.current?.focus()
  }, [chat?.id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [chat?.id, chat?.messages.length])

  function resize(element) {
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`
  }

  async function submit() {
    const value = text
    if (!value.trim() || sending) return
    setSending(true)
    setError('')
    setText('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
    try {
      await onSend(value)
    } catch (err) {
      setError(err.message || 'Не отправилось')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  if (!chat) {
    return (
      <section className="pane pane-empty">
        {pollError && <div className="banner">{pollError}</div>}
        <div className="placeholder">
          <div className="logo">
            <PlaneIcon />
          </div>
          <p>Выберите чат слева или создайте новый по номеру телефона.</p>
        </div>
      </section>
    )
  }

  const groups = groupByDay(chat.messages)
  const subtitle = chat.phone ? formatPhone(chat.phone) : 'личный чат'

  return (
    <section className="pane">
      <header className="dialog-head">
        <button type="button" className="icon-btn back" onClick={onBack} aria-label="К списку чатов">
          <BackIcon />
        </button>
        <Avatar title={chat.title} seed={chat.id} size={42} />
        <div className="dialog-peer">
          <strong>{chat.title}</strong>
          <span>{subtitle}</span>
        </div>
      </header>

      {pollError && <div className="banner">{pollError}</div>}

      <div className="thread">
        {chat.messages.length === 0 && (
          <div className="day">Напишите первое сообщение</div>
        )}
        {groups.map((group) => (
          <div key={group.label} className="day-group">
            <div className="day">{group.label}</div>
            {group.items.map((message, index) => {
              const prev = group.items[index - 1]
              const same = prev && prev.out === message.out
              return (
                <article
                  key={message.id}
                  className={[
                    'bubble',
                    message.out ? 'out' : 'in',
                    same ? 'same' : '',
                    message.status === 'failed' ? 'failed' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <span className="bubble-text">{message.text}</span>
                  <span className="meta">
                    {message.status === 'failed' ? (
                      <button type="button" className="retry" onClick={() => onRetry(message)}>
                        повторить
                      </button>
                    ) : (
                      <span>{formatClock(message.time)}</span>
                    )}
                    {message.out && message.status !== 'failed' && (
                      <Status status={message.status} />
                    )}
                  </span>
                </article>
              )
            })}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="composer-wrap">
        {error && <p className="composer-error">{error}</p>}
      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          maxLength={4096}
          placeholder="Сообщение"
          aria-label="Сообщение"
          onChange={(event) => {
            setText(event.target.value)
            setError('')
            resize(event.target)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
        />
        <button className="send" type="submit" disabled={!text.trim() || sending} aria-label="Отправить">
          <PlaneIcon />
        </button>
      </form>
      </div>
    </section>
  )
}

function Status({ status }) {
  if (status === 'pending') return <span className="clock" aria-label="отправляется" />
  if (status === 'read') return <span className="status read" aria-label="прочитано"><CheckIcon double /></span>
  if (status === 'delivered') return <span className="status" aria-label="доставлено"><CheckIcon double /></span>
  return <span className="status" aria-label="отправлено"><CheckIcon /></span>
}

function groupByDay(messages) {
  const groups = []
  messages.forEach((message) => {
    const label = dayLabel(message.time)
    const last = groups[groups.length - 1]
    if (!last || last.label !== label) groups.push({ label, items: [message] })
    else last.items.push(message)
  })
  return groups
}
