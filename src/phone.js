import { formatPhone } from './format'

export function normalizeRecipient(input) {
  const raw = String(input || '').trim()
  if (!raw) return { error: 'Введите номер телефона' }

  let digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  }
  if (digits.length < 10 || digits.length > 15) {
    return { error: 'Номер в международном формате, например 79991234567' }
  }

  return {
    payload: { phoneNumber: Number(digits) },
    phone: digits,
  }
}

export function titleFromAccount(data, phone) {
  if (data?.username) {
    const name = String(data.username)
    return name.startsWith('@') ? name : `@${name}`
  }
  return formatPhone(data?.phoneNumber || phone) || 'Без имени'
}
