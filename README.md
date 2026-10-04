# Чат для Telegram через GREEN-API

Простой веб-чат на React: отправить текст в Telegram и увидеть ответ. Внешний вид — обычный чат из двух колонок, без копии конкретного клиента.

Сообщения ходят через [GREEN-API для Telegram](https://green-api.com/telegram/). `idInstance`, `apiTokenInstance` и `apiUrl` берутся в [личном кабинете](https://console.green-api.com/).

## Запуск

```bash
npm install
npm run dev
```

## Сценарий

1. В кабинете создайте инстанс Telegram и авторизуйте его QR-кодом. Webhook URL оставьте пустым, иначе очередь входящих не отдаётся.
2. На сайте введите `idInstance` и `apiTokenInstance`. `apiUrl` по умолчанию `https://api.green-api.com` — подставьте другой, если в кабинете указан он.
3. Создайте чат: номер телефона в международном формате, например `79991234567`. Номер с восьмёрки (`8999...`) приводится к `7`.
4. Напишите текст и отправьте. Когда собеседник ответит в Telegram, сообщение появится в этом чате.

Данные инстанса и переписка хранятся в `localStorage` браузера.

## Методы

Номер сначала переводится в `chatId` через [CheckAccount](https://green-api.com/telegram/docs/api/service/CheckAccount/). Так ответ попадает в тот же чат: у Telegram идентификатор чата — не сам номер.

- Вход проверяется через [GetStateInstance](https://green-api.com/telegram/docs/api/account/GetStateInstance/)
- Отправка текста: [SendMessage](https://green-api.com/telegram/docs/api/sending/SendMessage/)
- Входящие: [ReceiveNotification](https://green-api.com/telegram/docs/api/receiving/technology-http-api/ReceiveNotification/) и сразу [DeleteNotification](https://green-api.com/telegram/docs/api/receiving/technology-http-api/DeleteNotification/)

В ленту попадают только текстовые сообщения. Остальные уведомления из очереди снимаются и не показываются.
