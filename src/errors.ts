export function errorText(err: unknown) {
  return err instanceof Error ? err.message : ''
}

export function isRateLimit(err: unknown) {
  return /429|too many requests|rate.?limit/i.test(errorText(err))
}

export function explainError(message?: string) {
  const text = String(message || '').trim()
  if (!text) return 'Не получилось выполнить запрос'

  if (/webhook/i.test(text)) {
    return 'В кабинете заполнен webhook URL. Очистите его и подождите около минуты, иначе входящие не приходят в чат.'
  }
  if (/429|too many requests|rate.?limit/i.test(text)) {
    return 'GREEN-API временно ограничил запросы. Подождите около минуты — профиль подтянется сам.'
  }
  if (/Rate limited by messenger/i.test(text)) {
    return 'WhatsApp временно ограничил проверку номеров на этом аккаунте.'
  }
  if (/not authorized/i.test(text)) {
    return 'Инстанс не авторизован. Отсканируйте QR в WhatsApp через кабинет GREEN-API.'
  }
  if (/temporarily unavailable/i.test(text)) {
    return 'Сервера WhatsApp сейчас не отвечают. Попробуйте через минуту.'
  }
  if (/instance is starting/i.test(text)) {
    return 'Инстанс ещё запускается. Подождите минуту и повторите.'
  }
  if (text === 'Ошибка 401' || text === 'Ошибка 403') {
    return 'GREEN-API не принял idInstance или токен.'
  }
  if (/Failed to fetch|NetworkError|Load failed/i.test(text)) {
    return 'Нет связи с GREEN-API. Проверьте интернет и apiUrl.'
  }

  return text
}
