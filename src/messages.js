import { formatPhone } from './format'

function byRecent(a, b) {
  return b.updatedAt - a.updatedAt
}

function toMs(ts) {
  if (!ts) return Date.now()
  return ts < 1e12 ? ts * 1000 : ts
}

function isPhoneLike(value) {
  return /^\+?[\d\s()-]+$/.test(value || '')
}

function pickTitle(current, incoming, phone) {
  const name = String(incoming || '').trim()
  if (name && !isPhoneLike(name) && !name.startsWith('@')) return name
  if (current && !isPhoneLike(current)) return current
  if (name) return name
  if (current) return current
  if (phone) return formatPhone(phone)
  return 'Без имени'
}

function readText(body) {
  const data = body.messageData
  if (!data) return ''
  if (data.typeMessage === 'textMessage') return data.textMessageData?.textMessage || ''
  if (data.typeMessage === 'extendedTextMessage' || data.typeMessage === 'quotedMessage') {
    return data.extendedTextMessageData?.text || data.textMessageData?.textMessage || ''
  }
  return ''
}

export function createChatRecord({ id, phone, title }) {
  return {
    id: String(id),
    phone: phone ? String(phone) : '',
    title: title || 'Без имени',
    messages: [],
    updatedAt: Date.now(),
  }
}

export function appendOutgoing(chats, chatId, message) {
  return chats
    .map((chat) => {
      if (chat.id !== chatId) return chat
      return {
        ...chat,
        messages: [...chat.messages, message],
        updatedAt: message.time,
      }
    })
    .sort(byRecent)
}

export function settleOutgoing(chats, chatId, localId, serverId) {
  return chats.map((chat) => {
    if (chat.id !== chatId) return chat
    const alreadyThere = chat.messages.some((item) => item.id === serverId)
    return {
      ...chat,
      messages: chat.messages.flatMap((item) => {
        if (item.id !== localId) return [item]
        if (alreadyThere) return []
        return [{ ...item, id: serverId, status: 'sent' }]
      }),
      updatedAt: Date.now(),
    }
  })
}

export function failOutgoing(chats, chatId, localId) {
  return chats.map((chat) => {
    if (chat.id !== chatId) return chat
    return {
      ...chat,
      messages: chat.messages.map((item) => (
        item.id === localId ? { ...item, status: 'failed' } : item
      )),
    }
  })
}

function blankChat(chatId, meta) {
  return createChatRecord({
    id: chatId,
    phone: meta.phone || '',
    title: pickTitle('', meta.title, meta.phone),
  })
}

function insertMessage(chats, chatId, message, meta) {
  const index = chats.findIndex((chat) => chat.id === chatId)
  if (index === -1) {
    const created = blankChat(chatId, meta)
    created.messages = [message]
    created.updatedAt = message.time
    return [created, ...chats].sort(byRecent)
  }

  const chat = chats[index]
  if (chat.messages.some((item) => item.id === message.id)) return chats

  let messages = chat.messages
  if (message.out) {
    const pendingIndex = messages.findIndex((item) => (
      item.out && item.status === 'pending' && item.text === message.text
    ))
    if (pendingIndex !== -1) {
      messages = messages.slice()
      messages[pendingIndex] = {
        ...messages[pendingIndex],
        id: message.id,
        status: 'sent',
        time: messages[pendingIndex].time,
      }
      const next = chats.slice()
      next[index] = {
        ...chat,
        messages,
        title: pickTitle(chat.title, meta.title, meta.phone),
        phone: chat.phone || meta.phone || '',
        updatedAt: message.time,
      }
      return next.sort(byRecent)
    }
  }

  const next = chats.slice()
  next[index] = {
    ...chat,
    messages: [...messages, message].sort((a, b) => a.time - b.time),
    title: pickTitle(chat.title, meta.title, meta.phone),
    phone: chat.phone || meta.phone || '',
    updatedAt: message.time,
  }
  return next.sort(byRecent)
}

export function applyNotification(chats, notice) {
  const body = notice?.body
  if (!body?.typeWebhook) return chats

  if (body.typeWebhook !== 'incomingMessageReceived' && body.typeWebhook !== 'outgoingMessageReceived') {
    return chats
  }

  const text = readText(body).trim()
  if (!text) return chats

  const sender = body.senderData || {}
  const chatId = String(sender.chatId || sender.sender || '')
  if (!chatId) return chats

  const outgoing = body.typeWebhook === 'outgoingMessageReceived'
  return insertMessage(chats, chatId, {
    id: String(body.idMessage || notice.receiptId),
    text,
    out: outgoing,
    time: toMs(body.timestamp),
    status: outgoing ? 'sent' : undefined,
  }, {
    title: sender.chatName || sender.senderName || sender.senderContactName || '',
    phone: sender.senderPhoneNumber ? String(sender.senderPhoneNumber) : '',
  })
}
