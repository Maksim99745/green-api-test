import { avatarColor } from '../format'

export default function Avatar({ title, seed, size = 54 }) {
  const letter = String(title || '?').replace('@', '').trim().charAt(0).toUpperCase() || '?'
  return (
    <span
      className="avatar"
      style={{ background: avatarColor(seed || title), width: size, height: size, fontSize: size > 42 ? 20 : 16 }}
    >
      {letter}
    </span>
  )
}
