export interface Creds {
  idInstance: string
  apiTokenInstance: string
  apiUrl: string
}

export interface WaAccount {
  stateInstance?: string
  phone?: string | number
  avatar?: string
  base64Avatar?: string
  chatId?: string
  deviceId?: string
  wid?: string
}

export interface CheckWhatsappResult {
  existsWhatsapp?: boolean
  chatId?: string
  username?: string
  phoneNumber?: string | number
  status?: boolean
  reason?: string
  data?: { reason?: string }
}

export interface SentMessage {
  idMessage?: string
}

export type MessageStatus = 'pending' | 'sent' | 'failed'

export interface ChatMessage {
  id: string
  text: string
  out: boolean
  time: number
  status?: MessageStatus
}

export interface Chat {
  id: string
  phone: string
  title: string
  messages: ChatMessage[]
  updatedAt: number
}

export interface Profile {
  phone: string
  avatar: string
}

export interface IncomingNotice {
  receiptId?: number | string
  body?: {
    typeWebhook?: string
    timestamp?: number
    idMessage?: string
    senderData?: {
      chatId?: string
      sender?: string
      chatName?: string
      senderName?: string
      senderContactName?: string
      senderPhoneNumber?: string | number
    }
    messageData?: {
      typeMessage?: string
      textMessageData?: { textMessage?: string }
      extendedTextMessageData?: { text?: string }
    }
  }
}
