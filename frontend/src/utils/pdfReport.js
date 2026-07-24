import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Relatorios usam os dados ja carregados na tela — nao fazem nova chamada de API.

export function generateAlertsReport(alerts, companyName) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Apex Security — Relatório de Alertas', 14, 20)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Empresa: ${companyName || 'N/A'}`, 14, 28)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 33)

  autoTable(doc, {
    startY: 40,
    head: [['Severidade', 'Título', 'Repositório', 'Data']],
    body: alerts.map(a => [
      a.severity_adjusted || a.severity,
      a.title,
      a.repository,
      a.created_at ? new Date(a.created_at).toLocaleDateString('pt-BR') : '-',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [30, 26, 10] },
  })

  doc.save(`apex-security-alertas-${Date.now()}.pdf`)
}

export function generateRiskReport(riskAssessments, companyName) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Apex Security — Relatório de Risco', 14, 20)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Empresa: ${companyName || 'N/A'}`, 14, 28)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 33)

  autoTable(doc, {
    startY: 40,
    head: [['Alerta ID', 'Impacto Financeiro', 'SLA', 'Nível de Compliance']],
    body: riskAssessments.map(r => [
      r.alert_id,
      `${r.financial_impact_min || '-'} a ${r.financial_impact_max || '-'}`,
      r.sla_deadline || '-',
      r.compliance_risk_level || '-',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [30, 26, 10] },
  })

  doc.save(`apex-security-risco-${Date.now()}.pdf`)
}
