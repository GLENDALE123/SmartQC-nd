import { apiClient } from './client';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

export const authApi = {
  // 로그인
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },

  // 회원가입
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', userData);
    return res.data;
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  // 로그아웃 (클라이언트 측)
  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
};