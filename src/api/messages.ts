import type { Creds, IncomingNotice, SentMessage } from '../types'
import { call, endpoint } from './client'

export function sendMessage(creds: Creds, chatId: string, message: string) {
  return call<SentMessage>(endpoint(creds, 'sendMessage'), {
    method: 'POST',
    body: JSON.stringify({ chatId, message }),
  })
}

export function receiveNotification(creds: Creds, timeout: number, signal: AbortSignal) {
  const url = `${endpoint(creds, 'receiveNotification')}?receiveTimeout=${timeout}`
  return call<IncomingNotice>(url, { signal })
}

export function deleteNotification(creds: Creds, receiptId: number | string) {
  return call<unknown>(`${endpoint(creds, 'deleteNotification')}/${receiptId}`, {
    method: 'DELETE',
  })
}
