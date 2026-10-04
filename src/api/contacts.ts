import type { CheckWhatsappResult, Creds } from '../types'
import { call, endpoint } from './client'

export function checkWhatsapp(creds: Creds, phoneNumber: number) {
  return call<CheckWhatsappResult>(endpoint(creds, 'checkWhatsapp'), {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  })
}
