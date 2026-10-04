// Хост, id и токен лежат в кабинете GREEN-API.
// Для Telegram те же пути, что и у остальных мессенджеров: /waInstance{id}/{method}/{token}

export const DEFAULT_API_URL = 'https://api.green-api.com'

export function normalizeApiUrl(url) {
  const value = String(url || DEFAULT_API_URL).trim().replace(/\/+$/, '')
  return value || DEFAULT_API_URL
}

function endpoint(creds, method) {
  const apiUrl = normalizeApiUrl(creds.apiUrl)
  const id = encodeURIComponent(String(creds.idInstance).trim())
  const token = encodeURIComponent(String(creds.apiTokenInstance).trim())
  return `${apiUrl}/waInstance${id}/${method}/${token}`
}

function readError(data) {
  if (!data) return ''
  if (typeof data === 'string') return data
  if (typeof data.reason === 'string' && data.reason) return data.reason
  if (typeof data.message === 'string' && data.message) return data.message
  if (typeof data.error === 'string' && data.error) return data.error
  if (data.data?.reason) return String(data.data.reason)
  return ''
}

async function call(url, options = {}) {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const raw = await response.text()
  let data = null
  if (raw) {
    try {
      data = JSON.parse(raw)
    } catch {
      data = raw
    }
  }

  if (!response.ok) {
    throw new Error(readError(data) || `Ошибка ${response.status}`)
  }

  return data
}

export function getStateInstance(creds) {
  return call(endpoint(creds, 'getStateInstance'))
}

export function checkAccount(creds, payload) {
  return call(endpoint(creds, 'checkAccount'), {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function sendMessage(creds, chatId, message) {
  return call(endpoint(creds, 'sendMessage'), {
    method: 'POST',
    body: JSON.stringify({ chatId, message }),
  })
}

export function receiveNotification(creds, timeout, signal) {
  const url = `${endpoint(creds, 'receiveNotification')}?receiveTimeout=${timeout}`
  return call(url, { signal })
}

export function deleteNotification(creds, receiptId) {
  return call(`${endpoint(creds, 'deleteNotification')}/${receiptId}`, {
    method: 'DELETE',
  })
}
