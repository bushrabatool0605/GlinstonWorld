// ecommerce-admin/src/services/api.js — REPLACE

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Never return "[object Object]"
const extractError = (e) => {
  const data = e.response?.data;
  if (data) {
    if (typeof data.message === 'string' && data.message) return data.message;
    if (typeof data.detail  === 'string' && data.detail)  return data.detail;
    if (Array.isArray(data.detail) && data.detail.length) {
      const f = data.detail[0];
      const field = f.loc?.slice(1).join(' → ') || '';
      return field ? `${field}: ${f.msg}` : f.msg;
    }
    if (Array.isArray(data.errors) && data.errors.length) return data.errors[0];
  }
  if (typeof e.message === 'string' && e.message && e.message !== '[object Object]') return e.message;
  return 'Something went wrong. Please try again.';
};

const err = (e) => { throw new Error(extractError(e)); };

export const authAPI = {
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user } = res.data.data;
      if (user.role !== 'admin') throw new Error('Admin access required. Your account does not have admin privileges.');
      localStorage.setItem('admin_token', access_token);
      return res.data;
    } catch (e) { err(e); }
  },
  logout: () => { localStorage.removeItem('admin_token'); window.location.href = '/login'; },
  getMe: async () => {
    try { const res = await api.get('/auth/me'); return res.data; }
    catch (e) { err(e); }
  },
};

export const productAPI = {
  getAll: async (params = {}) => {
    try { const res = await api.get('/products', { params }); return res.data; }
    catch (e) { err(e); }
  },
  create: async (data) => {
    try { const res = await api.post('/products', data); return res.data; }
    catch (e) { err(e); }
  },
  update: async (id, data) => {
    try { const res = await api.put(`/products/${id}`, data); return res.data; }
    catch (e) { err(e); }
  },
  delete: async (id) => {
    try { const res = await api.delete(`/products/${id}`); return res.data; }
    catch (e) { err(e); }
  },
};

export const orderAPI = {
  getAll: async (params = {}) => {
    try { const res = await api.get('/admin/orders', { params }); return res.data; }
    catch (e) { err(e); }
  },
  updateStatus: async (id, status, trackingNumber) => {
    try { const res = await api.patch(`/admin/orders/${id}/status`, { status, trackingNumber }); return res.data; }
    catch (e) { err(e); }
  },
};

export const statsAPI = {
  getSummary: async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/admin/orders', { params: { page: 1, limit: 100 } }),
        api.get('/products',     { params: { page: 1, limit: 100 } }),
      ]);
      const orders   = ordersRes.data.data   || [];
      const products = productsRes.data.data || [];

      const totalRevenue = orders
        .filter(o => ['paid','processing','shipped','delivered'].includes(o.status))
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const revenueByMonth = {};
      orders.forEach(o => {
        const month = new Date(o.createdAt).toLocaleString('default', { month: 'short' });
        revenueByMonth[month] = (revenueByMonth[month] || 0) + (o.total || 0);
      });

      const ordersByStatus = {};
      orders.forEach(o => {
        ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
      });

      return {
        totalRevenue,
        totalOrders:    orders.length,
        totalProducts:  products.length,
        lowStock:       products.filter(p => p.stock <= 5).length,
        revenueChart:   Object.entries(revenueByMonth).map(([name, revenue]) => ({ name, revenue: Math.round(revenue) })),
        ordersByStatus: Object.entries(ordersByStatus).map(([name, value]) => ({ name, value })),
        recentOrders:   orders.slice(0, 5),
      };
    } catch (e) { err(e); }
  },
};
export const settingsAPI = {
  get: async () => {
    try { const res = await api.get('/settings'); return res.data; }
    catch (e) { err(e); }
  },
  update: async (data) => {
    try { const res = await api.put('/settings', data); return res.data; }
    catch (e) { err(e); }
  },
};
export default api;
