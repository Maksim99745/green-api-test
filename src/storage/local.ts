import type { Chat, Creds } from '../types'

const CREDS_KEY = 'green-api-test:creds'

function chatsKey(idInstance: string) {
  return `green-api-test:chats:${idInstance}`
}

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as unknown : null
  } catch {
    return null
  }
}

function isCreds(value: unknown): value is Creds {
  if (!value || typeof value !== 'object') return false
  const creds = value as Partial<Creds>
  return Boolean(creds.idInstance && creds.apiTokenInstance && creds.apiUrl)
}

export function loadCreds(): Creds | null {
  const creds = read(CREDS_KEY)
  return isCreds(creds) ? creds : null
}

export function saveCreds(creds: Creds) {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds))
}

export function clearCreds() {
  localStorage.removeItem(CREDS_KEY)
}

export function loadChats(idInstance: string): Chat[] {
  const chats = read(chatsKey(idInstance))
  return Array.isArray(chats) ? chats as Chat[] : []
}

export function saveChats(idInstance: string, chats: Chat[]) {
  localStorage.setItem(chatsKey(idInstance), JSON.stringify(chats))
}
