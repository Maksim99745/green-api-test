import type { Creds } from '../types'

export const DEFAULT_API_URL = 'https://api.green-api.com'

export function normalizeApiUrl(url?: string) {
  const value = String(url || DEFAULT_API_URL).trim().replace(/\/+$/, '')
  return value || DEFAULT_API_URL
}

export function endpoint(creds: Creds, method: string) {
  const apiUrl = normalizeApiUrl(creds.apiUrl)
  const id = encodeURIComponent(String(creds.idInstance).trim())
  const token = encodeURIComponent(String(creds.apiTokenInstance).trim())
  return `${apiUrl}/waInstance${id}/${method}/${token}`
}

function readError(data: unknown) {
  if (!data) return ''
  if (typeof data === 'string') return data
  if (typeof data !== 'object') return ''
  const record = data as {
    reason?: unknown
    message?: unknown
    error?: unknown
    data?: { reason?: unknown }
  }
  if (typeof record.reason === 'string' && record.reason) return record.reason
  if (typeof record.message === 'string' && record.message) return record.message
  if (typeof record.error === 'string' && record.error) return record.error
  if (record.data?.reason) return String(record.data.reason)
  return ''
}

export async function call<T>(url: string, options: RequestInit = {}): Promise<T | null> {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers,
  })

  const raw = await response.text()
  let data: unknown = null
  if (raw) {
    try {
      data = JSON.parse(raw) as unknown
    } catch {
      data = raw
    }
  }

  if (!response.ok) {
    throw new Error(readError(data) || `Ошибка ${response.status}`)
  }

  return data as T | null
}
