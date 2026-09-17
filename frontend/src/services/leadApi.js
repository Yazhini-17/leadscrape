import api from './api'

export const leadApi = {
  getLeads: (taskId, params = {}) =>
    api.get(`/api/tasks/${taskId}/leads`, { params }),

  getLead: (leadId) =>
    api.get(`/api/leads/${leadId}`),

  saveLead: (leadId) =>
    api.post(`/api/leads/${leadId}/save`),

  deleteLead: (leadId) =>
    api.delete(`/api/leads/${leadId}`),

  getSavedLeads: (page = 1, perPage = 20) =>
    api.get('/api/saved-leads', { params: { page, per_page: perPage } }),

  removeSavedLead: (id) =>
    api.delete(`/api/saved-leads/${id}`),

  getDashboardStats: () =>
    api.get('/api/dashboard/stats'),
}
