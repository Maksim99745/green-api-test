import { useState } from 'react'
import { DEFAULT_API_URL } from '../api'
import { explainError } from '../errors'
import { PlaneIcon } from '../icons'

export default function Login({ onSubmit }) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  const [showToken, setShowToken] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
          Текстовые сообщения в Telegram через GREEN-API. idInstance и apiTokenInstance
          {' '}
          — из <a href="https://console.green-api.com/" target="_blank" rel="noreferrer">кабинета</a>,
          инстанс нужно авторизовать по QR.
        </p>

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
    </div>
  )
}
