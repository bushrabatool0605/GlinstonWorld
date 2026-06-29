// src/services/api.js — REPLACE existing file

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        localStorage.setItem('access_token', data.data.access_token);
        original.headers.Authorization = `Bearer ${data.data.access_token}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extract a clean, readable error message from any error shape.
 * Never returns "[object Object]".
 */
const extractErrorMessage = (error) => {
  if (!error) return 'Something went wrong. Please try again.';

  const data = error.response?.data;

  if (data) {
    // Our custom format: { message: "..." }
    if (typeof data.message === 'string' && data.message) return data.message;

    // FastAPI default: { detail: "..." }
    if (typeof data.detail === 'string' && data.detail) return data.detail;

    // FastAPI validation errors: { detail: [{loc, msg}] }
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      const first = data.detail[0];
      const field = first.loc?.slice(1).join(' → ') || '';
      return field ? `${field}: ${first.msg}` : first.msg;
    }

    // Our validation format: { errors: ["...", "..."] }
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0];
    }
  }

  // Plain JS error
  if (typeof error.message === 'string' && error.message && error.message !== '[object Object]') {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

const handleError = (error) => {
  throw new Error(extractErrorMessage(error));
};

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: async (data) => {
    try { const res = await api.post('/auth/register', data); return res.data; }
    catch (e) { handleError(e); }
  },
  login: async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      const { access_token, refresh_token } = res.data.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      return res.data;
    } catch (e) { handleError(e); }
  },
  logout: () => { localStorage.clear(); window.location.href = '/login'; },
  getMe: async () => {
    try { const res = await api.get('/auth/me'); return res.data; }
    catch (e) { handleError(e); }
  },
};

// ── Products ──────────────────────────────────────────────────────────────
export const productAPI = {
  getAll: async (params = {}) => {
    try { const res = await api.get('/products', { params }); return res.data; }
    catch (e) { handleError(e); }
  },
  getBySlug: async (slug) => {
    try { const res = await api.get(`/products/${slug}`); return res.data; }
    catch (e) { handleError(e); }
  },
  create: async (data) => {
    try { const res = await api.post('/products', data); return res.data; }
    catch (e) { handleError(e); }
  },
  update: async (id, data) => {
    try { const res = await api.put(`/products/${id}`, data); return res.data; }
    catch (e) { handleError(e); }
  },
  delete: async (id) => {
    try { const res = await api.delete(`/products/${id}`); return res.data; }
    catch (e) { handleError(e); }
  },
};

// ── Cart ──────────────────────────────────────────────────────────────────
export const cartAPI = {
  get: async () => {
    try { const res = await api.get('/cart'); return res.data; }
    catch (e) { handleError(e); }
  },
  addItem: async (productId, quantity = 1) => {
    try { const res = await api.post('/cart/items', { productId, quantity }); return res.data; }
    catch (e) { handleError(e); }
  },
  updateItem: async (productId, quantity) => {
    try { const res = await api.patch(`/cart/items/${productId}`, { quantity }); return res.data; }
    catch (e) { handleError(e); }
  },
  removeItem: async (productId) => {
    try { const res = await api.patch(`/cart/items/${productId}`, { quantity: 0 }); return res.data; }
    catch (e) { handleError(e); }
  },
  clear: async () => {
    try { const res = await api.delete('/cart'); return res.data; }
    catch (e) { handleError(e); }
  },
};

// ── Orders ────────────────────────────────────────────────────────────────
export const orderAPI = {
  place: async (data) => {
    try { const res = await api.post('/orders', data); return res.data; }
    catch (e) { handleError(e); }
  },
  getMyOrders: async (params = {}) => {
    try { const res = await api.get('/orders', { params }); return res.data; }
    catch (e) { handleError(e); }
  },
  getByNumber: async (orderNumber) => {
    try { const res = await api.get(`/orders/${orderNumber}`); return res.data; }
    catch (e) { handleError(e); }
  },
};

// ── Store Settings ────────────────────────────────────────────────────────
export const settingsAPI = {
  get: async () => {
    try { const res = await api.get('/settings'); return res.data; }
    catch (e) { handleError(e); }
  },
};

export default api;
