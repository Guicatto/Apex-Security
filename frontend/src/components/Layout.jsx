import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '◈' },
  { path: '/alerts', label: 'Alertas', icon: '⚠' },
  { path: '/remediations', label: 'Remediações', icon: '⚕' },
  { path: '/pull-requests', label: 'Pull Requests', icon: '⟲' },
  { path: '/repositories', label: 'Repositórios', icon: '◉' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0A0A0A',
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(180deg, #111111 0%, #0A0A0A 100%)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        flexShrink: 0,
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/apex-logo.png"
            alt="Apex Security"
            style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: '4px' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  background: isActive ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(201, 168, 76, 0.3)' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: isActive ? '#C9A84C' : '#8A7A5A',
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '400',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#C9A84C'
                    e.currentTarget.style.background = 'rgba(201, 168, 76, 0.05)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#8A7A5A'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span style={{ fontSize: '12px', opacity: 0.7 }}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#1A6B3C',
            boxShadow: '0 0 6px rgba(26, 107, 60, 0.8)',
          }} />
          <span style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: '11px',
            color: '#8A7A5A',
            letterSpacing: '0.1em',
          }}>SISTEMA ATIVO</span>
        </div>

        {/* Linha dourada embaixo do header */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
        }} />
      </header>

      {/* Conteúdo */}
      <main style={{
        flex: 1,
        overflow: 'auto',
        padding: '32px',
      }}>
        {children}
      </main>
    </div>
  )
}
