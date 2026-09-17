import api from './api'

export const authApi = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),

  register: (email, fullName, password) =>
    api.post('/api/auth/register', { email, full_name: fullName, password }),

  getMe: () =>
    api.get('/api/auth/me'),
}
