import axios from 'axios';

// Interfaces
interface RegisterData {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
}

interface GetAllParams {
  search?: string;
  category?: string;
  month?: number;
  year?: number;
}

interface AnnouncementData {
  title: string;
  content: string;
  category: string;
}

interface UpdateStatusData {
  status: string;
}

interface RateData {
  rating: number;
  comment: string;
}

interface EventData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  category: string;
}

interface ContactData {
  name: string;
  position: string;
  phone: string;
  email: string;
}

interface UpdateProfileData {
  fullName: string;
  phone?: string;
  address?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData: RegisterData) => 
    api.post('/auth/register', userData),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
  
  refreshToken: (refreshToken: string) => 
    api.post('/auth/refresh', { refreshToken }),
};

// Announcements API
export const announcementsAPI = {
  getAll: (params?: GetAllParams) => 
    api.get('/announcements', { params }),
  
  create: (data: AnnouncementData) => 
    api.post('/announcements', data),
  
  update: (id: string, data: AnnouncementData) => 
    api.put(`/announcements/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/announcements/${id}`),
};

// Complaints API
export const complaintsAPI = {
  getAll: (params?: GetAllParams) => 
    api.get('/complaints', { params }),
  
  create: (data: FormData) => 
    api.post('/complaints', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  updateStatus: (id: string, data: UpdateStatusData) => 
    api.patch(`/complaints/${id}/status`, data),
  
  rate: (id: string, data: RateData) => 
    api.patch(`/complaints/${id}/rate`, data),
};

// Events API
export const eventsAPI = {
  getAll: (params?: GetAllParams) => 
    api.get('/events', { params }),
  
  create: (data: EventData) => 
    api.post('/events', data),
  
  update: (id: string, data: EventData) => 
    api.put(`/events/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/events/${id}`),
};

// Documents API
export const documentsAPI = {
  getAll: (params?: GetAllParams) => 
    api.get('/documents', { params }),
  
  upload: (data: FormData) => 
    api.post('/documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  download: (id: string) => 
    api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  
  delete: (id: string) => 
    api.delete(`/documents/${id}`),
};

// Gallery API
export const galleryAPI = {
  getAll: (params?: GetAllParams) => 
    api.get('/gallery', { params }),
  
  upload: (data: FormData) => 
    api.post('/gallery', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  delete: (id: string) => 
    api.delete(`/gallery/${id}`),
};

// Contacts API
export const contactsAPI = {
  getAll: (params?: GetAllParams) => 
    api.get('/contacts', { params }),
  
  create: (data: ContactData) => 
    api.post('/contacts', data),
  
  update: (id: string, data: ContactData) => 
    api.put(`/contacts/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/contacts/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => 
    api.get('/dashboard/stats'),
  
  getAnalytics: (period?: string) => 
    api.get('/dashboard/analytics', { params: { period } }),
};

// Users API
export const usersAPI = {
  getAll: (params?: GetAllParams) => 
    api.get('/users', { params }),
  
  updateProfile: (data: UpdateProfileData) => 
    api.put('/users/profile', data),
  
  changePassword: (data: ChangePasswordData) => 
    api.put('/users/password', data),
  
  updateRole: (id: string, role: string) => 
    api.patch(`/users/${id}/role`, { role }),
};

export default api;