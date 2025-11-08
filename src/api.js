import axios from 'axios';

const API = axios.create({
  baseURL: 'http://13.235.187.13:8000', 
});

export const getMenuItems = () => API.get('/menu').then((r) => r.data);
export const getMenuItemById = (id) => API.get(`/menu/${id}`).then((r) => r.data);
export const createMenuItem = (data) => API.post('/menu', data).then((r) => r.data);
export const updateMenuItem = (id, data) => API.put(`/menu/${id}`, data).then((r) => r.data);
export const deleteMenuItem = (id) => API.delete(`/menu/${id}`).then((r) => r.data);

// 🧾 ORDERS (already existing)
export const listOrders = (page = 1, date) => API.get(`/orders?page=${page}&limit=10${date ? `&date=${date}` : ""}`).then((r) => r.data);
export const getOrder = (id) => API.get(`/orders/${id}`).then((r) => r.data);
export const createOrder = (data) => API.post('/orders', data).then((r) => r.data);