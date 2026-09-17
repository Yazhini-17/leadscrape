import api from './api'

function triggerDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export const exportApi = {
  exportPDF: async (taskId) => {
    const res = await api.get(`/api/tasks/${taskId}/export/pdf`, {
      responseType: 'blob',
    })
    const filename = `leads_${taskId}.pdf`
    triggerDownload(res.data, filename)
  },

  exportExcel: async (taskId) => {
    const res = await api.get(`/api/tasks/${taskId}/export/excel`, {
      responseType: 'blob',
    })
    const filename = `leads_${taskId}.xlsx`
    triggerDownload(res.data, filename)
  },

  getExports: () =>
    api.get('/api/exports'),
}
