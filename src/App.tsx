import { useEffect, useState } from 'react'
import { getStateInstance, loadAccount } from './api/account'
import { normalizeApiUrl } from './api/client'
import { checkWhatsapp } from './api/contacts'
import { deleteNotification, receiveNotification, sendMessage } from './api/messages'
import { normalizeRecipient, phoneDigits, titleFromAccount } from './chat/phone'
import {
  appendOutgoing,
  applyNotification,
  createChatRecord,
  failOutgoing,
  settleOutgoing,
} from './chat/records'
import { errorText, explainError, isRateLimit } from './errors'
import { clearCreds, loadChats, loadCreds, saveChats, saveCreds } from './storage/local'
import type { Chat, Creds, Profile } from './types'
import Dialog from './components/Dialog'
import Login from './components/Login'
import Sidebar from './components/Sidebar'

export default function App() {
  const [creds, setCreds] = useState<Creds | null>(loadCreds)
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = loadCreds()
    return saved ? loadChats(saved.idInstance) : []
  })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [instanceState, setInstanceState] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [accountNote, setAccountNote] = useState('')
  const [pollError, setPollError] = useState('')

  useEffect(() => {
    if (!creds) return
    saveChats(creds.idInstance, chats)
  }, [creds, chats])

  useEffect(() => {
    if (!creds) return undefined
    const current = creds
    let cancelled = false
    let timer = 0

    async function run() {
      try {
        const data = await loadAccount(current)
        if (cancelled) return
        setInstanceState(data.state)
        setProfile({ phone: data.phone, avatar: data.avatar })
        setAccountNote('')
      } catch (err) {
        if (cancelled) return
        setProfile({ phone: '', avatar: '' })
        setAccountNote(explainError(errorText(err)))
        if (isRateLimit(err)) timer = window.setTimeout(run, 30000)
      }
    }

    run()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [creds])

  useEffect(() => {
    if (!creds) return undefined
    const current = creds
    const controller = new AbortController()
    let stopped = false

    async function loop() {
      while (!stopped) {
        try {
          const started = Date.now()
          const notice = await receiveNotification(current, 20, controller.signal)
          if (stopped) return
          setPollError('')
          if (!notice?.receiptId) {
            // Пустой ответ должен висеть до receiveTimeout. Если сервер
            // отдал его сразу, не крутим новый запрос каждую секунду.
            const elapsed = Date.now() - started
            if (elapsed < 5000) await wait(5000 - elapsed)
            if (stopped) return
            continue
          }
          setChats((prev) => applyNotification(prev, notice))
          try {
            await deleteNotification(current, notice.receiptId)
          } catch {
            // повторим на следующем круге, дубли сообщений отсекаются по id
          }
        } catch (err) {
          if (stopped || isAbort(err)) return
          setPollError(explainError(errorText(err)))
          await wait(isRateLimit(err) ? 30000 : 4000)
        }
      }
    }

    loop()
    return () => {
      stopped = true
      controller.abort()
    }
  }, [creds])

  async function handleLogin(form: { idInstance: string; apiTokenInstance: string; apiUrl: string }) {
    const next: Creds = {
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
      throw new Error('Инстанс не авторизован. В кабинете GREEN-API отсканируйте QR в WhatsApp: Связанные устройства.')
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
    setProfile(null)
    setAccountNote('')
    setPollError('')
  }

  async function handleCreate(raw: string) {
    if (!creds) return
    const recipient = normalizeRecipient(raw)
    if ('error' in recipient) throw new Error(recipient.error)

    const data = await checkWhatsapp(creds, recipient.payload.phoneNumber)
    if (data?.status === false) {
      throw new Error(explainError(data.reason || data.data?.reason || 'Не удалось проверить номер'))
    }
    if (!data?.existsWhatsapp || !data.chatId) {
      throw new Error('WhatsApp на этом номере не найден.')
    }

    const id = String(data.chatId)
    const phone = phoneDigits(data.phoneNumber) || recipient.phone
    setChats((prev) => {
      if (prev.some((chat) => chat.id === id || (phone && chat.phone === phone))) return prev
      return [createChatRecord({
        id,
        phone,
        title: titleFromAccount(data, phone),
      }), ...prev]
    })
    setActiveId(id)
  }

  async function handleSend(text: string) {
    if (!creds) return
    const chatId = activeId
    const trimmed = text.trim()
    if (!chatId || !trimmed) return
    if (trimmed.length > 20000) {
      throw new Error('WhatsApp принимает до 20000 символов')
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
      throw new Error(explainError(errorText(err)))
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
        profile={profile}
        accountNote={accountNote}
        onSelect={setActiveId}
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

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isAbort(err: unknown) {
  return err instanceof Error && err.name === 'AbortError'
}
