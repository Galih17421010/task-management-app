import axios from 'axios';
import { register } from '../../../server/src/config/database';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Token Request 
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors 
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default {
    // Auth 
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),

    // Task
    getTasks: (params) => api.get('/tasks', { params }),
    createTask: (taskData) => api.post('/tasks', taskData),
    updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
    deleteTask: (id) => api.delete(`/task/${id}`),

    // Comment
    getComments: (taskId) => api.get(`/comments/${taskId}`),
    addComment: (taskId, content) => api.post('/comments', { taskId, content }),

    // Notification
    getNotifications: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`)
};