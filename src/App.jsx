import { useEffect, useRef, useState } from 'react'
import {
  checkAccount,
  deleteNotification,
  getStateInstance,
  normalizeApiUrl,
  receiveNotification,
  sendMessage,
} from './api'
import { explainError } from './errors'
import {
  appendOutgoing,
  applyNotification,
  createChatRecord,
  failOutgoing,
  settleOutgoing,
} from './messages'
import { normalizeRecipient, titleFromAccount } from './phone'
import { clearCreds, loadChats, loadCreds, saveChats, saveCreds } from './storage'
import Dialog from './components/Dialog'
import Login from './components/Login'
import Sidebar from './components/Sidebar'

export default function App() {
  const [creds, setCreds] = useState(loadCreds)
  const [chats, setChats] = useState(() => {
    const saved = loadCreds()
    return saved ? loadChats(saved.idInstance) : []
  })
  const [activeId, setActiveId] = useState(null)
  const [instanceState, setInstanceState] = useState('')
  const [pollError, setPollError] = useState('')
  const activeIdRef = useRef(null)
  activeIdRef.current = activeId

  useEffect(() => {
    if (!creds) return
    saveChats(creds.idInstance, chats)
  }, [creds, chats])

  useEffect(() => {
    if (!creds) return undefined
    let cancelled = false
    getStateInstance(creds)
      .then((state) => {
        if (!cancelled) setInstanceState(state?.stateInstance || '')
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [creds])

  useEffect(() => {
    if (!creds) return undefined
    const controller = new AbortController()
    let stopped = false

    async function loop() {
      while (!stopped) {
        try {
          // Пустой ответ — это таймаут, а не ошибка. Уведомление надо удалить,
          // иначе следующее получение вернёт его же.
          const notice = await receiveNotification(creds, 20, controller.signal)
          if (stopped) return
          setPollError('')
          if (!notice?.receiptId) continue
          setChats((prev) => applyNotification(prev, notice))
          try {
            await deleteNotification(creds, notice.receiptId)
          } catch {
            // повторим на следующем круге, дубли сообщений отсекаются по id
          }
        } catch (err) {
          if (stopped || err.name === 'AbortError') return
          setPollError(explainError(err.message))
          await wait(4000)
        }
      }
    }

    loop()
    return () => {
      stopped = true
      controller.abort()
    }
  }, [creds])

  async function handleLogin(form) {
    const next = {
      idInstance: form.idInstance.trim(),
      apiTokenInstance: form.apiTokenInstance.trim(),
      apiUrl: normalizeApiUrl(form.apiUrl),
    }

    if (!/^\d+$/.test(next.idInstance)) {
      throw new Error('idInstance — это число из кабинета')
    }
    if (next.apiTokenInstance.length < 8) {
      throw new Error('Вставьте apiTokenInstance целиком')
    }
    if (!/^https?:\/\//i.test(next.apiUrl)) {
      throw new Error('apiUrl должен начинаться с http:// или https://')
    }

    const state = await getStateInstance(next)
    const value = state?.stateInstance
    if (!value) {
      throw new Error('Не получилось проверить инстанс. Проверьте id, токен и apiUrl.')
    }
    if (value === 'notAuthorized') {
      throw new Error('Инстанс не авторизован. В кабинете GREEN-API отсканируйте QR из Telegram.')
    }
    if (value === 'blocked') {
      throw new Error('Инстанс заблокирован.')
    }

    saveCreds(next)
    setCreds(next)
    setChats(loadChats(next.idInstance))
    setActiveId(null)
    setInstanceState(value)
    setPollError(value === 'starting'
      ? 'Инстанс ещё запускается. Отправка может заработать через минуту.'
      : '')
  }

  function handleLogout() {
    clearCreds()
    setCreds(null)
    setChats([])
    setActiveId(null)
    setInstanceState('')
    setPollError('')
  }

  function handleSelect(id) {
    setActiveId(id)
  }

  async function handleCreate(raw) {
    const recipient = normalizeRecipient(raw)
    if (recipient.error) throw new Error(recipient.error)

    // В Telegram писать нужно по chatId. Номер в виде 7999...@c.us
    // для входящих не подходит: ответ придёт уже с другим id.
    const data = await checkAccount(creds, recipient.payload)
    if (data?.status === false) {
      throw new Error(explainError(data.reason || data.data?.reason || 'Не удалось проверить номер'))
    }
    if (!data?.exist || !data.chatId) {
      throw new Error('Telegram на этом номере не найден. Иногда номер скрыт настройками приватности.')
    }

    const id = String(data.chatId)
    setChats((prev) => {
      if (prev.some((chat) => chat.id === id)) return prev
      return [createChatRecord({
        id,
        phone: data.phoneNumber || recipient.phone || '',
        title: titleFromAccount(data, recipient.phone),
      }), ...prev]
    })
    setActiveId(id)
  }

  async function handleSend(text) {
    const chatId = activeIdRef.current
    const trimmed = text.trim()
    if (!chatId || !trimmed) return
    if (trimmed.length > 4096) {
      throw new Error('Telegram принимает до 4096 символов')
    }

    const localId = `local-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
    setChats((prev) => appendOutgoing(prev, chatId, {
      id: localId,
      text: trimmed,
      out: true,
      time: Date.now(),
      status: 'pending',
    }))

    try {
      const result = await sendMessage(creds, chatId, trimmed)
      if (!result?.idMessage) throw new Error('Сервер не вернул id сообщения')
      setChats((prev) => settleOutgoing(prev, chatId, localId, String(result.idMessage)))
    } catch (err) {
      setChats((prev) => failOutgoing(prev, chatId, localId))
      throw new Error(explainError(err.message))
    }
  }

  if (!creds) {
    return <Login onSubmit={handleLogin} />
  }

  const activeChat = chats.find((chat) => chat.id === activeId) || null

  return (
    <div className={activeId ? 'app chat-open' : 'app'}>
      <Sidebar
        chats={chats}
        activeId={activeId}
        instanceId={creds.idInstance}
        instanceState={instanceState}
        onSelect={handleSelect}
        onCreate={handleCreate}
        onLogout={handleLogout}
      />
      <Dialog
        chat={activeChat}
        pollError={pollError}
        onSend={handleSend}
        onBack={() => setActiveId(null)}
      />
    </div>
  )
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
