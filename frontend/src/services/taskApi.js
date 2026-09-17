import api from './api'

export const taskApi = {
  createTask: (data) =>
    api.post('/api/scrape', data),

  getTasks: (page = 1, perPage = 20, status = null) => {
    const params = { page, per_page: perPage }
    if (status) params.status = status
    return api.get('/api/tasks', { params })
  },

  getTask: (taskId) =>
    api.get(`/api/tasks/${taskId}`),

  deleteTask: (taskId) =>
    api.delete(`/api/tasks/${taskId}`),

  cancelTask: (taskId) =>
    api.post(`/api/tasks/${taskId}/cancel`),
}
