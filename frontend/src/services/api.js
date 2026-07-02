import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('luxefit_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('luxefit_token');
      localStorage.removeItem('luxefit_user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject({ message, status: error.response?.status });
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getFlashSale: () => api.get('/products/flash-sale'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  // Variant APIs
  addVariant: (productId, data) => api.post(`/products/${productId}/variants`, data),
  updateVariant: (productId, variantId, data) => api.put(`/products/${productId}/variants/${variantId}`, data),
  deleteVariant: (productId, variantId) => api.delete(`/products/${productId}/variants/${variantId}`),
  reorderVariantImages: (productId, variantId, images) => api.put(`/products/${productId}/variants/${variantId}/reorder-images`, { images }),
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (itemId, data) => api.put(`/cart/item/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/item/${itemId}`),
  clear: () => api.delete('/cart/clear'),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  getAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  getKey: () => api.get('/payments/key'),
};

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  toggle: (productId) => api.post('/wishlist/toggle', { productId }),
  clear: () => api.delete('/wishlist/clear'),
};

export const reviewAPI = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (productId, data) => api.post(`/reviews/product/${productId}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const couponAPI = {
  validate: (data) => api.post('/coupons/validate', data),
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

export const locationAPI = {
  checkPincode: (pincode) => api.get(`/location/check/${pincode}`),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  addAddress: (data) => api.post('/users/address', data),
  updateAddress: (id, data) => api.put(`/users/address/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/address/${id}`),
  getAll: (params) => api.get('/users', { params }),
  updateRole: (id, data) => api.put(`/users/${id}/role`, data),
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getAllAdmin: () => api.get('/categories/all'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put('/categories/' + id, data),
  delete: (id) => api.delete('/categories/' + id),
  addType: (id, type) => api.post('/categories/' + id + '/types', { type }),
  removeType: (id, type) => api.delete('/categories/' + id + '/types/' + encodeURIComponent(type)),
  renameType: (id, oldType, newType) => api.put('/categories/' + id + '/types/rename', { oldType, newType }),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
};

export default api;
