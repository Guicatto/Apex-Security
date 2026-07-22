import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '◈' },
  { path: '/alerts', label: 'Alertas', icon: '⚠' },
  { path: '/remediations', label: 'Remediações', icon: '⚕' },
  { path: '/pull-requests', label: 'Pull Requests', icon: '⟲' },
  { path: '/real-risk', label: 'Risco Real', icon: '◆' },
  { path: '/repositories', label: 'Repositórios', icon: '◉' },
  // Módulos avançados (consultivos) — separados visualmente na navegação
  { path: '/anomaly-analysis', label: 'Anomalias', icon: '✦', advanced: true },
  { path: '/intent-checker', label: 'Intenção', icon: '⟡', advanced: true },
  { path: '/radar', label: 'Radar', icon: '◎', advanced: true },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const companyName = localStorage.getItem('company_name')

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('api_key')
    localStorage.removeItem('company_name')
    navigate('/login')
  }

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
        <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.path
            const isFirstAdvanced = item.advanced && !navItems[idx - 1]?.advanced
            return (
              <span key={item.path} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isFirstAdvanced && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    margin: '0 6px 0 8px',
                  }}>
                    <span style={{ width: '1px', height: '20px', background: '#2A2200' }} />
                    <span style={{
                      fontFamily: "'Raleway', sans-serif",
                      fontSize: '8px',
                      color: '#8B6914',
                      letterSpacing: '0.2em',
                      writingMode: 'horizontal-tb',
                      whiteSpace: 'nowrap',
                    }}>AVANÇADOS</span>
                  </span>
                )}
              <button
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
              </span>
            )
          })}
        </nav>

        {/* Status + conta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
            }}>{companyName || 'SISTEMA ATIVO'}</span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid #2A2200',
              borderRadius: '6px',
              padding: '5px 12px',
              color: '#8A7A5A',
              fontFamily: "'Raleway', sans-serif",
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2200'; e.currentTarget.style.color = '#8A7A5A' }}
          >
            SAIR
          </button>
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
