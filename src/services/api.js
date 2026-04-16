import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Matéria-Prima
export const getMateriaPrima = () => api.get('/materia-prima');
export const getMateriaPrimaById = (id) => api.get(`/materia-prima/${id}`);
export const createMateriaPrima = (data) => api.post('/materia-prima', data);
export const updateMateriaPrima = (id, data) => api.put(`/materia-prima/${id}`, data);
export const deleteMateriaPrima = (id) => api.delete(`/materia-prima/${id}`);
export const getQRCode = (id) => api.get(`/materia-prima/${id}/qrcode`);

// Stocks / Movimentações
export const getMovimentacoes = (params) => api.get('/stocks', { params });
export const createMovimentacao = (data) => api.post('/stocks', data);

export default api;
