# Чат для WhatsApp через GREEN-API

`idInstance`, `apiTokenInstance` и `apiUrl` берутся в [личном кабинете](https://console.green-api.com/).

## Запуск

```bash
npm install
npm run dev
```

## Сценарий

1. В кабинете создайте инстанс WhatsApp и авторизуйте его QR-кодом (Настройки → Связанные устройства). Webhook URL оставьте пустым.
2. На сайте введите данные инстанса. Если в кабинете указан другой хост, подставьте его в `apiUrl`.
3. Создайте чат по номеру, например `79991234567`. Номер с `8` в начале приводится к `7`.
4. Отправьте текст. Ответ из WhatsApp появится в этом чате.

Вход и переписка хранятся в `localStorage` браузера, отдельно для каждого `idInstance`.

## Методы

[GetStateInstance](https://green-api.com/docs/api/account/GetStateInstance/), [GetWaSettings](https://green-api.com/docs/api/account/GetWaSettings/), [CheckWhatsapp](https://green-api.com/docs/api/service/CheckWhatsapp/), [SendMessage](https://green-api.com/docs/api/sending/SendMessage/), [ReceiveNotification](https://green-api.com/docs/api/receiving/technology-http-api/ReceiveNotification/) и [DeleteNotification](https://green-api.com/docs/api/receiving/technology-http-api/DeleteNotification/). В ленту попадают только текстовые сообщения.
