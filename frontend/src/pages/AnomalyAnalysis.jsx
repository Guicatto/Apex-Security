import { useState, useEffect } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import Card from '../components/Card'
import { getAnomalyAnalysis, getAlerts } from '../services/api'

export default function AnomalyAnalysis() {
  const [data, setData] = useState(null)
  const [alertsById, setAlertsById] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchAnalysis = () => {
    setLoading(true)
    Promise.all([getAnomalyAnalysis(), getAlerts()])
      .then(([analysisRes, alertsRes]) => {
        setData(analysisRes.data)
        const byId = {}
        for (const a of alertsRes.data) byId[a.id] = a
        setAlertsById(byId)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAnalysis() }, [])

  const scores = data?.scores || {}
  const points = Object.entries(scores).map(([id, s], idx) => ({
    index: idx + 1,
    alertId: Number(id),
    score: s.anomaly_score,
    isAnomaly: s.is_anomaly,
    title: alertsById[id]?.title || `Alerta #${id}`,
  }))
  const normals = points.filter(p => !p.isAnomaly)
  const anomalies = points.filter(p => p.isAnomaly)

  return (
    <div>
      {/* Título */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '24px',
          fontWeight: '600',
          color: '#F0E6C8',
          letterSpacing: '0.05em',
          marginBottom: '4px',
        }}>Análise de Anomalias</h1>
        <p style={{ color: '#8A7A5A', fontFamily: 'Raleway', fontSize: '13px' }}>
          Identificação automática de comportamentos fora do padrão no seu ambiente
        </p>
      </div>

      {/* Cabeçalho explicativo — consultivo, não substitui o Módulo 3 */}
      <Card style={{ marginBottom: '24px', borderLeft: '2px solid #8B6914' }}>
        <p style={{ fontFamily: 'Inter', fontSize: '13px', color: '#F0E6C8', lineHeight: 1.7 }}>
          Esta análise aplica um algoritmo de Machine Learning não-supervisionado (Isolation Forest)
          sobre o conjunto atual de alertas, identificando quais fogem estatisticamente do padrão.
          Este é um <strong style={{ color: '#E8C97A' }}>sinal consultivo</strong> — a priorização
          oficial de severidade continua sendo feita pelas regras determinísticas de contexto IaC.
        </p>
      </Card>

      {loading ? (
        <div style={{ color: '#8A7A5A', fontFamily: 'Raleway', letterSpacing: '0.2em' }}>CARREGANDO...</div>
      ) : !data ? (
        <Card>
          <div style={{ color: '#C0392B', textAlign: 'center', padding: '32px', fontFamily: 'Raleway' }}>
            Não foi possível carregar a análise. Verifique se a API está no ar.
          </div>
        </Card>
      ) : !data.trained ? (
        /* Dados insuficientes — comportamento esperado, não é erro */
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px', color: '#8A7A5A' }}>⟡</div>
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '16px',
              color: '#E8C97A',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}>Volume de dados insuficiente</div>
            <p style={{ fontFamily: 'Inter', fontSize: '13px', color: '#8A7A5A', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
              O Isolation Forest precisa de um volume mínimo de alertas (10) para gerar uma análise
              estatística confiável. {data.reason}. Conforme novos scans chegarem pelo pipeline,
              esta análise se tornará disponível automaticamente.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Card de status do modelo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <Card>
              <div style={{ fontFamily: 'Raleway', fontSize: '11px', fontWeight: '500', color: '#8A7A5A', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>Modelo</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', color: '#1A6B3C' }}>TREINADO ✓</div>
            </Card>
            <Card>
              <div style={{ fontFamily: 'Raleway', fontSize: '11px', fontWeight: '500', color: '#8A7A5A', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>Alertas analisados</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: '28px', fontWeight: '700', color: '#F0E6C8' }}>{data.total_analyzed}</div>
            </Card>
            <Card style={{ background: 'linear-gradient(135deg, #1A1400 0%, #111111 100%)', border: '1px solid #C9A84C40' }}>
              <div style={{ fontFamily: 'Raleway', fontSize: '11px', fontWeight: '500', color: '#8A7A5A', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>Anomalias encontradas</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: '28px', fontWeight: '700', color: '#E8C97A' }}>{data.anomalies_found}</div>
            </Card>
          </div>

          {/* Scatter plot */}
          <Card style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ fontFamily: 'Raleway', fontSize: '12px', fontWeight: '600', color: '#8A7A5A', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Dispersão de scores de anomalia
              </div>
              <div style={{ display: 'flex', gap: '16px', fontFamily: 'Raleway', fontSize: '11px' }}>
                <span style={{ color: '#8A7A5A' }}>● dentro do padrão</span>
                <span style={{ color: '#E8C97A' }}>● anômalo</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <XAxis
                  type="number"
                  dataKey="index"
                  name="Alerta"
                  tick={{ fill: '#8A7A5A', fontSize: 11, fontFamily: 'Inter' }}
                  axisLine={{ stroke: '#2A2200' }}
                  tickLine={false}
                  label={{ value: 'índice do alerta', position: 'insideBottom', offset: -5, fill: '#8A7A5A', fontSize: 11, fontFamily: 'Raleway' }}
                />
                <YAxis
                  type="number"
                  dataKey="score"
                  name="Score"
                  tick={{ fill: '#8A7A5A', fontSize: 11, fontFamily: 'Inter' }}
                  axisLine={{ stroke: '#2A2200' }}
                  tickLine={false}
                  label={{ value: 'anomaly score', angle: -90, position: 'insideLeft', fill: '#8A7A5A', fontSize: 11, fontFamily: 'Raleway' }}
                />
                <ReferenceLine y={0} stroke="#8B6914" strokeDasharray="4 4" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: '#8B6914' }}
                  contentStyle={{
                    background: '#111111',
                    border: '1px solid #2A2200',
                    borderRadius: '8px',
                    color: '#F0E6C8',
                    fontFamily: 'Inter',
                    fontSize: '12px',
                  }}
                  formatter={(value, name) => [value, name === 'score' ? 'anomaly score' : name]}
                  labelFormatter={() => ''}
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null
                    const p = payload[0].payload
                    return (
                      <div style={{ background: '#111111', border: '1px solid #2A2200', borderRadius: '8px', padding: '10px 12px', fontFamily: 'Inter', fontSize: '12px' }}>
                        <div style={{ color: '#F0E6C8', marginBottom: '4px', maxWidth: '260px' }}>{p.title}</div>
                        <div style={{ color: p.isAnomaly ? '#E8C97A' : '#8A7A5A', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
                          score: {p.score} {p.isAnomaly ? '· ANÔMALO ⟡' : ''}
                        </div>
                      </div>
                    )
                  }}
                />
                <Scatter name="Dentro do padrão" data={normals} fill="#8A7A5A" />
                <Scatter
                  name="Anômalo"
                  data={anomalies}
                  fill="#E8C97A"
                  shape={(props) => (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={7}
                      fill="#E8C97A"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(232, 201, 122, 0.8))' }}
                    />
                  )}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>

          {/* Lista de alertas anômalos */}
          <Card style={{ marginBottom: '24px' }}>
            <div style={{ fontFamily: 'Raleway', fontSize: '12px', fontWeight: '600', color: '#8A7A5A', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Alertas estatisticamente incomuns
            </div>
            {anomalies.length === 0 ? (
              <div style={{ color: '#8A7A5A', fontFamily: 'Inter', fontSize: '13px' }}>
                Nenhuma anomalia detectada na base atual — todos os alertas seguem o padrão estatístico.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {anomalies.map(p => (
                  <div key={p.alertId} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    background: '#0A0A0A',
                    border: '1px solid #C9A84C',
                    borderRadius: '8px',
                    boxShadow: '0 0 12px rgba(201, 168, 76, 0.15)',
                  }}>
                    <span style={{ fontSize: '16px', color: '#E8C97A', flexShrink: 0 }}>⟡</span>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontFamily: 'Inter', fontSize: '13px', color: '#F0E6C8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.title}
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#8A7A5A' }}>
                        Alerta #{p.alertId}
                      </div>
                    </div>
                    <span style={{
                      background: 'rgba(232, 201, 122, 0.12)',
                      color: '#E8C97A',
                      border: '1px solid #E8C97A40',
                      borderRadius: '4px',
                      padding: '3px 10px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px',
                      flexShrink: 0,
                    }}>score {p.score}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Botão de reexecutar */}
      {!loading && (
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          style={{
            background: 'rgba(201, 168, 76, 0.1)',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            borderRadius: '8px',
            padding: '10px 24px',
            color: '#C9A84C',
            fontFamily: 'Raleway',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.3)' }}
        >
          {loading ? 'REEXECUTANDO...' : '⟳ REEXECUTAR ANÁLISE'}
        </button>
      )}
    </div>
  )
}
