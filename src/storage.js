const CREDS_KEY = 'green-api-test:creds'

function chatsKey(idInstance) {
  return `green-api-test:chats:${idInstance}`
}

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function loadCreds() {
  const creds = read(CREDS_KEY)
  if (!creds?.idInstance || !creds?.apiTokenInstance) return null
  return creds
}

export function saveCreds(creds) {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds))
}

export function clearCreds() {
  localStorage.removeItem(CREDS_KEY)
}

export function loadChats(idInstance) {
  const chats = read(chatsKey(idInstance))
  return Array.isArray(chats) ? chats : []
}

export function saveChats(idInstance, chats) {
  localStorage.setItem(chatsKey(idInstance), JSON.stringify(chats))
}
