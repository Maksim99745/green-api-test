import type { Creds, WaAccount } from '../types'
import { call, endpoint } from './client'

export function getStateInstance(creds: Creds) {
  return call<WaAccount>(endpoint(creds, 'getStateInstance'))
}

export function getWaSettings(creds: Creds) {
  return call<WaAccount>(endpoint(creds, 'getWaSettings'))
}

function getSettings(creds: Creds) {
  return call<WaAccount>(endpoint(creds, 'getSettings'))
}

function phoneFromAccount(data: WaAccount | null) {
  if (!data) return ''
  const direct = String(data.phone || '').replace(/\D/g, '')
  if (direct.length >= 11 && direct.length <= 16) return direct
  const device = String(data.deviceId || '').match(/^(\d{11,16})/)
  if (device) return device[1]
  const wid = String(data.wid || data.chatId || '').match(/(\d{11,16})@c\.us/i)
  return wid?.[1] || ''
}

function avatarFromAccount(data: WaAccount | null) {
  const raw = String(data?.base64Avatar || '').replace(/\s/g, '')
  if (raw) return raw.startsWith('data:') ? raw : `data:image/jpeg;base64,${raw}`
  return data?.avatar || ''
}

export async function loadAccount(creds: Creds) {
  const wa = await getWaSettings(creds)
  let phone = phoneFromAccount(wa)
  const avatar = avatarFromAccount(wa)
  let state = wa?.stateInstance || ''
  if (!phone) {
    const settings = await getSettings(creds)
    phone = phoneFromAccount(settings)
    state = state || settings?.stateInstance || ''
  }
  return { phone, avatar, state }
}
