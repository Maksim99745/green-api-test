import { useEffect, useState } from 'react'
import { DEFAULT_API_URL } from '../api'
import { explainError } from '../errors'
import { PlaneIcon } from '../icons'

const STEPS = [
  {
    title: 'Создайте инстанс',
    text: 'В кабинете GREEN-API создайте инстанс Telegram и авторизуйте его QR-кодом из приложения. Поле Webhook URL оставьте пустым, иначе ответы не попадут в этот чат.',
  },
  {
    title: 'Скопируйте данные',
    text: 'Возьмите idInstance и apiTokenInstance. apiUrl обычно https://api.green-api.com. Если в кабинете указан другой адрес, его нужно вставить в поле apiUrl.',
  },
  {
    title: 'Войдите',
    text: 'Введите три значения на этой странице и нажмите «Войти». Приложение проверит, что инстанс авторизован и готов отправлять сообщения.',
  },
  {
    title: 'Откройте чат',
    text: 'Нажмите «Новый чат» и введите номер в международном формате, например 79991234567. Номер, который начинается с 8, будет приведён к 7.',
  },
  {
    title: 'Напишите сообщение',
    text: 'Отправьте текст. Когда собеседник ответит в Telegram, сообщение появится в этом чате. В ленте показываются только текстовые сообщения.',
  },
]

export default function Login({ onSubmit }) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  const [showToken, setShowToken] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)

  useEffect(() => {
    if (!guideOpen) return undefined
    function onKey(event) {
      if (event.key === 'Escape') setGuideOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [guideOpen])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSubmit({ idInstance, apiTokenInstance, apiUrl })
    } catch (err) {
      setError(explainError(err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="logo">
          <PlaneIcon />
        </div>
        <h1>Чат</h1>
        <p className="lead">
          Текстовые сообщения в Telegram через GREEN-API.
        </p>
        <button type="button" className="guide-open" onClick={() => setGuideOpen(true)}>
          Как запустить
        </button>

        <label className="field">
          <span>idInstance</span>
          <input
            value={idInstance}
            onChange={(event) => setIdInstance(event.target.value)}
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            required
          />
        </label>

        <label className="field">
          <span>apiTokenInstance</span>
          <span className="token-wrap">
            <input
              value={apiTokenInstance}
              onChange={(event) => setApiTokenInstance(event.target.value)}
              type={showToken ? 'text' : 'password'}
              autoComplete="off"
              spellCheck={false}
              required
            />
            <button type="button" className="ghost" onClick={() => setShowToken((value) => !value)}>
              {showToken ? 'скрыть' : 'показать'}
            </button>
          </span>
        </label>

        <label className="field">
          <span>apiUrl</span>
          <input
            value={apiUrl}
            onChange={(event) => setApiUrl(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            required
          />
          <small>Если в кабинете указан другой хост, вставьте его сюда.</small>
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Проверяю инстанс...' : 'Войти'}
        </button>
      </form>

      {guideOpen && (
        <div className="guide-layer" onClick={() => setGuideOpen(false)}>
          <aside
            className="guide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="guide-head">
              <h2 id="guide-title">Как запустить</h2>
              <button type="button" className="guide-close" onClick={() => setGuideOpen(false)}>
                Закрыть
              </button>
            </header>
            <ol className="guide-steps">
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <span className="guide-num">{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="guide-note">
              idInstance и токен берутся в{' '}
              <a href="https://console.green-api.com/" target="_blank" rel="noreferrer">кабинете GREEN-API</a>.
              Данные входа и переписка хранятся только в этом браузере.
            </p>
          </aside>
        </div>
      )}
    </div>
  )
}
