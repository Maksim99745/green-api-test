import { useState } from 'react'
import { avatarColor } from '../format/display'

interface AvatarProps {
  title?: string
  seed?: string
  size?: number
  src?: string
}

export default function Avatar({ title, seed, size = 54, src }: AvatarProps) {
  const [broken, setBroken] = useState(false)
  const letter = String(title || '?').replace(/^\+/, '').trim().charAt(0).toUpperCase() || '?'
  const box = { width: size, height: size, fontSize: size > 42 ? 20 : 16 }

  if (src && !broken) {
    return (
      <img
        className="avatar"
        src={src}
        alt=""
        style={box}
        onError={() => setBroken(true)}
      />
    )
  }

  return (
    <span className="avatar" style={{ ...box, background: avatarColor(seed || title) }}>
      {letter}
    </span>
  )
}
