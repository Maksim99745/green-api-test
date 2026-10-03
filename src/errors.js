export function explainError(message) {
  const text = String(message || '').trim()
  if (!text) return 'Не получилось выполнить запрос'

  if (/webhook/i.test(text)) {
    return 'В кабинете заполнен webhook URL. Очистите его и подождите около минуты, иначе входящие не приходят в чат.'
  }
  if (/rate_limit_exceeded/i.test(text)) {
    return 'Слишком много проверок номеров. Telegram просит подождать пару часов.'
  }
  if (/Rate limited by messenger/i.test(text)) {
    return 'Telegram временно ограничил поиск контактов на этом аккаунте.'
  }
  if (/not authorized/i.test(text)) {
    return 'Инстанс не авторизован. Отсканируйте QR в кабинете GREEN-API.'
  }
  if (/temporarily unavailable/i.test(text)) {
    return 'Сервера Telegram сейчас не отвечают. Попробуйте через минуту.'
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
