import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
})

// Anexa o JWT em toda requisicao. O localStorage e a unica excecao ao padrao
// de nao usar storage no projeto — aqui e necessario para persistir a sessao.
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Sessao expirada ou invalida -> limpa e manda para o login
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const signup = (email, password, companyName) =>
  api.post('/auth/signup', { email, password, company_name: companyName })
export const login = (email, password) => api.post('/auth/login', { email, password })
export const getMe = () => api.get('/auth/me')
export const createSLAAssessment = (alertId) => api.post(`/sla-assessment/${alertId}`)
export const getRadar = () => api.get('/radar')
export const regenerateApiKey = () => api.post('/auth/regenerate-key')
export const saveDiscordWebhook = (webhookUrl) => api.post('/auth/discord-webhook', { webhook_url: webhookUrl })
export const testDiscordWebhook = () => api.post('/auth/discord-webhook/test')
export const sendContact = (data) => api.post('/contact', data)

export const getAlerts = (params = {}) => api.get('/alerts', { params })
export const getAlert = (id) => api.get(`/alerts/${id}`)
export const getStats = () => api.get('/stats')
export const remediate = (alertId) => api.post(`/remediate/${alertId}`)
export const getRemediation = (alertId) => api.get(`/remediations/${alertId}`)
export const getRemediations = () => api.get('/remediations')
export const createPR = (alertId) => api.post(`/pull-request/${alertId}`)
export const getAnomalyAnalysis = () => api.get('/anomaly-analysis')
export const checkIntent = (commitMessage, codeDiff) =>
  api.post('/intent-check', { commit_message: commitMessage, code_diff: codeDiff })
export const getCompanyProfile = () => api.get('/company-profile')
export const saveCompanyProfile = (data) => api.post('/company-profile', data)
export const createRiskAssessment = (alertId) => api.post(`/risk-assessment/${alertId}`)
export const getRiskAssessments = () => api.get('/risk-assessments')
export const getRiskAssessment = (alertId) => api.get(`/risk-assessment/${alertId}`)
export const getPRs = () => api.get('/pull-requests')
export const updatePRStatus = (prId, status, approvedBy) =>
  api.patch(`/pull-request/${prId}/status`, null, { params: { status, approved_by: approvedBy } })

export default api
