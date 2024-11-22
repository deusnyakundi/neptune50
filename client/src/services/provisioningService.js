import api from '../utils/api';

export const provisioningService = {
  async getAuthToken() {
    const response = await api.post('/auth/token');
    return response.data.token;
  },

  async provisionDevice(payload, token) {
    const response = await api.post('/provisioning/device', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async processBulkProvisioning(file, ticketNumber, reason) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ticketNumber', ticketNumber);
    formData.append('reason', reason);

    const response = await api.post('/provisioning/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getProvisioningHistory(filters) {
    const response = await api.get('/provisioning/history', {
      params: filters,
    });
    return response.data;
  },

  async exportResults(resultId) {
    const response = await api.get(`/provisioning/export/${resultId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
}; 