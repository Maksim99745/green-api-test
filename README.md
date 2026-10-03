# Чат Telegram через GREEN-API

Небольшой веб-чат: текстовые сообщения в Telegram и ответы собеседника. Интерфейс ориентирован на [веб-версию Telegram](https://web.telegram.org/a/).

Бэкендом выступает [GREEN-API для Telegram](https://green-api.com/telegram/). Свои `idInstance`, `apiTokenInstance` и `apiUrl` берутся в [личном кабинете](https://console.green-api.com/).

## Запуск

```bash
npm install
npm run dev
```

Сборка: `npm run build`.

## Как пользоваться

1. В кабинете создайте инстанс Telegram и авторизуйте его QR-кодом из приложения.
2. Webhook URL у инстанса должен быть пустым. Иначе метод получения очереди не отдаёт уведомления.
3. Откройте сайт, введите `idInstance` и `apiTokenInstance`. `apiUrl` по умолчанию `https://api.green-api.com` — если в кабинете другой хост, подставьте его.
4. Создайте чат по номеру телефона в международном формате (`79991234567`). Номер, который начинается с `8`, приводится к `7`.
5. Напишите текст и отправьте. Ответ из Telegram появится в этом же чате.

Учётные данные и переписка лежат в `localStorage` браузера, на сервер проекта ничего не уходит.

## Что вызывается

- Проверка инстанса при входе: [GetStateInstance](https://green-api.com/telegram/docs/api/account/GetStateInstance/)
- Номер превращается в `chatId` через [CheckAccount](https://green-api.com/telegram/docs/api/service/CheckAccount/). Писать по `chatId` нужно, чтобы входящий ответ попал в тот же чат, а не в отдельный диалог по номеру.
- Отправка текста: [SendMessage](https://green-api.com/telegram/docs/api/sending/SendMessage/)
- Входящие: длинный опрос [ReceiveNotification](https://green-api.com/telegram/docs/api/receiving/technology-http-api/ReceiveNotification/) и затем [DeleteNotification](https://green-api.com/telegram/docs/api/receiving/technology-http-api/DeleteNotification/)

Показываются только текстовые сообщения. Файлы и прочие типы уведомлений из очереди убираются, но в ленту не пишутся.
