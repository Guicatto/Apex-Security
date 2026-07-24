import { useNavigate, useLocation } from 'react-router-dom'

const menuItems = [
  { path: '/integration-key', label: 'Chave de Integração', icon: '⚿', desc: 'Conectar repositórios' },
  { path: '/account', label: 'Conta', icon: '◐', desc: 'Dados e sessão' },
  { path: '/contact', label: 'Contato', icon: '✉', desc: 'Falar com a equipe' },
  { path: '/notifications', label: 'Notificações', icon: '◔', desc: 'Alertas no Discord' },
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()

  const go = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      {/* Overlay — fecha ao clicar fora */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
          zIndex: 40,
        }}
      />

      {/* Painel deslizante */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '300px',
        background: '#111111',
        borderRight: '1px solid #2A2200',
        boxShadow: open ? '4px 0 24px rgba(201, 168, 76, 0.08)' : 'none',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <img src="/apex-logo.png" alt="Apex Security" style={{ height: '32px' }} />
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            style={{
              background: 'transparent', border: 'none', color: '#8A7A5A',
              fontSize: '18px', cursor: 'pointer', lineHeight: 1, padding: '4px 8px',
            }}
          >×</button>
        </div>

        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
          margin: '12px 0 20px',
        }} />

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: isActive ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(201, 168, 76, 0.3)' : 'transparent'}`,
                  borderRadius: '8px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(201, 168, 76, 0.05)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{
                  fontSize: '15px',
                  color: isActive ? '#C9A84C' : '#8A7A5A',
                  width: '18px',
                  flexShrink: 0,
                }}>{item.icon}</span>
                <span>
                  <span style={{
                    display: 'block',
                    fontFamily: "'Raleway', sans-serif",
                    fontSize: '13px',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#C9A84C' : '#F0E6C8',
                    letterSpacing: '0.03em',
                  }}>{item.label}</span>
                  <span style={{
                    display: 'block',
                    fontFamily: 'Inter',
                    fontSize: '11px',
                    color: '#8A7A5A',
                    marginTop: '1px',
                  }}>{item.desc}</span>
                </span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
