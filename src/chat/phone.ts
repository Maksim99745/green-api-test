import type { CheckWhatsappResult } from '../types'
import { formatPhone } from '../format/display'

export function phoneDigits(value?: string | number | null) {
  const text = String(value || '')
  const fromId = text.match(/(\d+)@c\.us/i)
  if (fromId) return fromId[1]
  const digits = text.replace(/\D/g, '')
  if (digits.length >= 11 && digits.length <= 16) return digits
  return ''
}

export function normalizeRecipient(input: string) {
  const raw = String(input || '').trim()
  if (!raw) return { error: 'Введите номер телефона' as const }

  let digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  }
  if (digits.length < 11 || digits.length > 16) {
    return { error: 'Номер в международном формате, от 11 до 16 цифр, например 79991234567' as const }
  }

  return {
    payload: { phoneNumber: Number(digits) },
    phone: digits,
  }
}

export function titleFromAccount(data: CheckWhatsappResult | null, phone: string) {
  const username = String(data?.username || '').trim()
  if (username) return username
  return formatPhone(phoneDigits(data?.phoneNumber) || phone) || 'Без имени'
}
