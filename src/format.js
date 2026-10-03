const AVATAR_COLORS = ['#e17076', '#faa774', '#a695e7', '#7bc862', '#6ec9cb', '#65aadd', '#ee7aae']

export function avatarColor(key) {
  const value = String(key || '?')
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash + value.charCodeAt(i) * (i + 1)) % AVATAR_COLORS.length
  }
  return AVATAR_COLORS[hash]
}

export function formatPhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }
  return `+${digits}`
}

export function formatClock(ts) {
  return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function formatListTime(ts) {
  if (!ts) return ''
  const date = new Date(ts)
  const now = new Date()
  if (sameDay(date, now)) return formatClock(ts)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export function dayLabel(ts) {
  const date = new Date(ts)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (sameDay(date, today)) return 'Сегодня'
  if (sameDay(date, yesterday)) return 'Вчера'
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

export function stateLabel(state) {
  switch (state) {
    case 'authorized':
      return 'авторизован'
    case 'notAuthorized':
      return 'не авторизован'
    case 'starting':
      return 'запускается'
    case 'blocked':
      return 'заблокирован'
    case 'sleepMode':
      return 'спит'
    default:
      return state || ''
  }
}
