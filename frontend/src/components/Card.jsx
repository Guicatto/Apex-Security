import { useState } from 'react'

export default function Card({ children, style = {}, onClick, hoverable = false }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
      style={{
        background: '#111111',
        border: `1px solid ${hovered && hoverable ? '#C9A84C' : '#2A2200'}`,
        borderRadius: '12px',
        padding: '24px',
        boxShadow: hovered && hoverable
          ? '0 8px 32px rgba(201, 168, 76, 0.16)'
          : '0 4px 24px rgba(201, 168, 76, 0.08)',
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
