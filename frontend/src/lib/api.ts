import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Users API
export const usersApi = {
  getAll: async (params?: { role?: string; isActive?: boolean }) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getActiveAgents: async () => {
    const response = await api.get('/users/agents');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getPerformance: async (id: string, params?: { dateFrom?: string; dateTo?: string }) => {
    const response = await api.get(`/users/${id}/performance`, { params });
    return response.data;
  },
};

// Customers API
export const customersApi = {
  getAll: async (params?: { stage?: string; source?: string; search?: string }) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  getTimeline: async (id: string) => {
    const response = await api.get(`/customers/${id}/timeline`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/customers/stats');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data;
  },

  updateStage: async (id: string, stage: string) => {
    const response = await api.patch(`/customers/${id}/stage`, { stage });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};

// Products API
export const productsApi = {
  getAll: async (params?: { category?: string; isActive?: boolean; search?: string }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/products/stats');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// Sales API
export const salesApi = {
  getAll: async (params?: {
    status?: string;
    agentId?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  getCommissions: async (params?: { agentId?: string; dateFrom?: string; dateTo?: string }) => {
    const response = await api.get('/sales/commissions', { params });
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/sales', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/sales/${id}`, data);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.patch(`/sales/${id}/approve`);
    return response.data;
  },

  complete: async (id: string) => {
    const response = await api.patch(`/sales/${id}/complete`);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.patch(`/sales/${id}/cancel`);
    return response.data;
  },
};

// Interactions API
export const interactionsApi = {
  getAll: async (params?: {
    customerId?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const response = await api.get('/interactions', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/interactions/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/interactions', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/interactions/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/interactions/${id}`);
    return response.data;
  },
};

// Partnerships API
export const partnershipsApi = {
  getAll: async (params?: { isActive?: boolean; search?: string }) => {
    const response = await api.get('/partnerships', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/partnerships/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/partnerships/stats');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/partnerships', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/partnerships/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/partnerships/${id}`);
    return response.data;
  },
};

// Referrals API
export const referralsApi = {
  getAll: async (params?: { status?: string; partnershipId?: string }) => {
    const response = await api.get('/referrals', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/referrals/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/referrals/stats');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/referrals', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/referrals/${id}`, data);
    return response.data;
  },

  convert: async (id: string, bonusAmount?: number) => {
    const response = await api.patch(`/referrals/${id}/convert`, { bonusAmount });
    return response.data;
  },

  expire: async (id: string) => {
    const response = await api.patch(`/referrals/${id}/expire`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/referrals/${id}`);
    return response.data;
  },
};

// Leads API
export const leadsApi = {
  getAll: async (params?: {
    status?: string;
    customerId?: string;
    agentId?: string;
    minClosureChance?: number;
  }) => {
    const response = await api.get('/leads', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/leads/stats');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/leads', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/leads/${id}`, data);
    return response.data;
  },

  markAsWon: async (id: string) => {
    const response = await api.patch(`/leads/${id}/won`);
    return response.data;
  },

  markAsLost: async (id: string) => {
    const response = await api.patch(`/leads/${id}/lost`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getDashboard: async (params?: { dateFrom?: string; dateTo?: string }) => {
    const response = await api.get('/analytics/dashboard', { params });
    return response.data;
  },

  getSalesFunnel: async () => {
    const response = await api.get('/analytics/sales-funnel');
    return response.data;
  },

  getAgentPerformance: async (params?: { dateFrom?: string; dateTo?: string }) => {
    const response = await api.get('/analytics/agent-performance', { params });
    return response.data;
  },

  getCommissions: async (params?: { dateFrom?: string; dateTo?: string; agentId?: string }) => {
    const response = await api.get('/analytics/commissions', { params });
    return response.data;
  },

  getCustomerRetention: async () => {
    const response = await api.get('/analytics/customer-retention');
    return response.data;
  },

  getRevenueForecast: async () => {
    const response = await api.get('/analytics/revenue-forecast');
    return response.data;
  },
};
