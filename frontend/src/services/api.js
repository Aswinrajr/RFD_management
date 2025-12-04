import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://rfd-management.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// RFP APIs
export const rfpAPI = {
  create: (data) => api.post('/rfps', data),
  getAll: () => api.get('/rfps'),
  getById: (id) => api.get(`/rfps/${id}`),
  update: (id, data) => api.put(`/rfps/${id}`, data),
  delete: (id) => api.delete(`/rfps/${id}`),
  sendToVendors: (data) => api.post('/rfps/send', data)
};

// Vendor APIs
export const vendorAPI = {
  create: (data) => api.post('/vendors', data),
  getAll: () => api.get('/vendors'),
  getById: (id) => api.get(`/vendors/${id}`),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`)
};

// Proposal APIs
export const proposalAPI = {
  create: (data) => api.post('/proposals', data),
  getByRFP: (rfpId) => api.get(`/proposals/rfp/${rfpId}`),
  getById: (id) => api.get(`/proposals/${id}`),
  compare: (rfpId) => api.get(`/proposals/compare/${rfpId}`),
  updateStatus: (id, status) => api.put(`/proposals/${id}/status`, { status }),
  startEmailListener: () => api.post('/proposals/email/start-listener'),
  checkNewEmails: () => api.post('/proposals/email/check')
};

export default api;
