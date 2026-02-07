import axios from 'axios';
import type {
  Application,
  Interview,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  CreateInterviewRequest,
  UpdateInterviewRequest,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  User,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：处理 401 错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<User>('/auth/register', data),

  me: () => api.get<User>('/auth/me'),
};

// Applications API
export const applicationApi = {
  list: (keyword?: string, statuses?: string[]) =>
    api.get<Application[]>('/applications', {
      params: {
        keyword,
        status: statuses?.length ? statuses.join(',') : undefined,
      },
    }),

  get: (id: number) => api.get<Application>(`/applications/${id}`),

  create: (data: CreateApplicationRequest) =>
    api.post<Application>('/applications', data),

  update: (id: number, data: UpdateApplicationRequest) =>
    api.put<Application>(`/applications/${id}`, data),

  delete: (id: number) => api.delete(`/applications/${id}`),
};

// Interviews API
export const interviewApi = {
  list: (start?: string, end?: string) =>
    api.get<Interview[]>('/interviews', { params: { start, end } }),

  get: (id: number) => api.get<Interview>(`/interviews/${id}`),

  create: (data: CreateInterviewRequest) =>
    api.post<Interview>('/interviews', data),

  update: (id: number, data: UpdateInterviewRequest) =>
    api.put<Interview>(`/interviews/${id}`, data),

  updateReview: (id: number, reviewContent: string) =>
    api.patch<Interview>(`/interviews/${id}/review`, {
      review_content: reviewContent,
    }),

  delete: (id: number) => api.delete(`/interviews/${id}`),
};

export default api;
