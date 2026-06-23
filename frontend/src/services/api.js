import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 30000,
})

export const getAlerts = (params = {}) => api.get('/alerts', { params })
export const getAlert = (id) => api.get(`/alerts/${id}`)
export const getStats = () => api.get('/stats')
export const remediate = (alertId) => api.post(`/remediate/${alertId}`)
export const getRemediation = (alertId) => api.get(`/remediations/${alertId}`)
export const getRemediations = () => api.get('/remediations')
export const createPR = (alertId) => api.post(`/pull-request/${alertId}`)
export const getPRs = () => api.get('/pull-requests')
export const updatePRStatus = (prId, status, approvedBy) =>
  api.patch(`/pull-request/${prId}/status`, null, { params: { status, approved_by: approvedBy } })

export default api
