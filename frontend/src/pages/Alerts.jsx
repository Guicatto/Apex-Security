import { useState, useEffect } from 'react'
import SeverityBadge from '../components/SeverityBadge'
import Card from '../components/Card'
import { getAlerts, remediate, createPR, createRiskAssessment } from '../services/api'

const severities = ['TODAS', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']
const tools = ['TODAS', 'semgrep', 'trivy']

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [severityFilter, setSeverityFilter] = useState('TODAS')
  const [toolFilter, setToolFilter] = useState('TODAS')
  const [actionLoading, setActionLoading] = useState({})
  const [messages, setMessages] = useState({})

  const fetchAlerts = () => {
    const params = {}
    if (severityFilter !== 'TODAS') params.severity = severityFilter
    if (toolFilter !== 'TODAS') params.source_tool = toolFilter
    getAlerts(params)
      .then(res => setAlerts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAlerts() }, [severityFilter, toolFilter])

  const handleRemediate = async (alertId) => {
    setActionLoading(p => ({ ...p, [`rem_${alertId}`]: true }))
    try {
      await remediate(alertId)
      setMessages(p => ({ ...p, [alertId]: '✓ Remediação gerada' }))
    } catch (e) {
      const msg = e.response?.data?.detail || 'Erro ao remediar'
      setMessages(p => ({ ...p, [alertId]: `✗ ${msg}` }))
    } finally {
      setActionLoading(p => ({ ...p, [`rem_${alertId}`]: false }))
    }
  }

  const handleCreatePR = async (alertId) => {
    setActionLoading(p => ({ ...p, [`pr_${alertId}`]: true }))
    try {
      const res = await createPR(alertId)
      setMessages(p => ({ ...p, [alertId]: `✓ PR criado: ${res.data.pr_url}` }))
    } catch (e) {
      // 401 = credencial do GitHub invalida/expirada: nao e erro do usuario,
      // e configuracao pendente da equipe. Mensagem diferenciada e amigavel.
      if (e.response?.status === 401) {
        setMessages(p => ({
          ...p,
          [alertId]: '⚠ Configuração pendente — token do GitHub precisa ser atualizado (ação da equipe)',
        }))
      } else {
        const msg = e.response?.data?.detail || 'Erro ao criar PR'
        setMessages(p => ({ ...p, [alertId]: `✗ ${msg}` }))
      }
    } finally {
      setActionLoading(p => ({ ...p, [`pr_${alertId}`]: false }))
    }
  }

  const handleMapRisk = async (alertId) => {
    setActionLoading(p => ({ ...p, [`risk_${alertId}`]: true }))
    try {
      await createRiskAssessment(alertId)
      setMessages(p => ({ ...p, [alertId]: '✓ Risco mapeado — ver aba Risco Real' }))
    } catch (e) {
      const msg = e.response?.data?.detail || 'Erro ao mapear risco'
      setMessages(p => ({ ...p, [alertId]: `✗ ${msg}` }))
    } finally {
      setActionLoading(p => ({ ...p, [`risk_${alertId}`]: false }))
    }
  }

  const filterBtnStyle = (active) => ({
    background: active ? 'rgba(201, 168, 76, 0.15)' : 'transparent',
    border: `1px solid ${active ? '#C9A84C' : '#2A2200'}`,
    borderRadius: '6px',
    padding: '5px 12px',
    color: active ? '#C9A84C' : '#8A7A5A',
    fontFamily: "'Raleway', sans-serif",
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  })

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '24px',
          color: '#F0E6C8',
          letterSpacing: '0.05em',
          marginBottom: '4px',
        }}>Alertas de Segurança</h1>
        <p style={{ color: '#8A7A5A', fontFamily: 'Raleway', fontSize: '13px' }}>
          {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} encontrado{alerts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ color: '#8A7A5A', fontSize: '11px', fontFamily: 'Raleway', letterSpacing: '0.1em', marginRight: '4px' }}>SEVERIDADE</span>
          {severities.map(s => (
            <button key={s} style={filterBtnStyle(severityFilter === s)} onClick={() => setSeverityFilter(s)}>
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ color: '#8A7A5A', fontSize: '11px', fontFamily: 'Raleway', letterSpacing: '0.1em', marginRight: '4px' }}>FERRAMENTA</span>
          {tools.map(t => (
            <button key={t} style={filterBtnStyle(toolFilter === t)} onClick={() => setToolFilter(t)}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ color: '#8A7A5A', fontFamily: 'Raleway', letterSpacing: '0.2em' }}>CARREGANDO...</div>
      ) : alerts.length === 0 ? (
        <Card>
          <div style={{ color: '#8A7A5A', textAlign: 'center', padding: '32px', fontFamily: 'Raleway' }}>
            Nenhum alerta encontrado com os filtros selecionados
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alerts.map(alert => (
            <div key={alert.id} style={{
              background: '#111111',
              border: '1px solid #2A2200',
              borderRadius: '12px',
              padding: '16px 20px',
              transition: 'all 0.2s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <SeverityBadge severity={alert.severity_adjusted || alert.severity} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'Inter',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#F0E6C8',
                    marginBottom: '4px',
                  }}>{alert.title}</div>
                  <div style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                    color: '#8A7A5A',
                  }}>
                    {alert.repository}{alert.file_path ? ` · ${alert.file_path}` : ''}{alert.line_number ? `:${alert.line_number}` : ''}
                  </div>
                  {messages[alert.id] && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: messages[alert.id].startsWith('✓') ? '#1A6B3C' : '#C0392B',
                      fontFamily: 'Inter',
                      wordBreak: 'break-all',
                    }}>{messages[alert.id]}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleRemediate(alert.id)}
                    disabled={actionLoading[`rem_${alert.id}`]}
                    style={{
                      background: 'rgba(201, 168, 76, 0.1)',
                      border: '1px solid rgba(201, 168, 76, 0.3)',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      color: '#C9A84C',
                      fontFamily: 'Raleway',
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      opacity: actionLoading[`rem_${alert.id}`] ? 0.5 : 1,
                    }}
                  >
                    {actionLoading[`rem_${alert.id}`] ? 'GERANDO...' : 'REMEDIAR'}
                  </button>
                  <button
                    onClick={() => handleCreatePR(alert.id)}
                    disabled={actionLoading[`pr_${alert.id}`]}
                    style={{
                      background: 'transparent',
                      border: '1px solid #2A2200',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      color: '#8A7A5A',
                      fontFamily: 'Raleway',
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      opacity: actionLoading[`pr_${alert.id}`] ? 0.5 : 1,
                    }}
                  >
                    {actionLoading[`pr_${alert.id}`] ? 'CRIANDO...' : 'CRIAR PR'}
                  </button>
                  <button
                    onClick={() => handleMapRisk(alert.id)}
                    disabled={actionLoading[`risk_${alert.id}`]}
                    style={{
                      background: 'transparent',
                      border: '1px solid #2A2200',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      color: '#8A7A5A',
                      fontFamily: 'Raleway',
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      opacity: actionLoading[`risk_${alert.id}`] ? 0.5 : 1,
                    }}
                  >
                    {actionLoading[`risk_${alert.id}`] ? 'MAPEANDO...' : 'MAPEAR RISCO'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
