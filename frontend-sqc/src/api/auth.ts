import { apiClient } from './client';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

export const authApi = {
  // 로그인
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/login', credentials);
    // 백엔드 응답 구조: {success: true, data: {access_token, refresh_token, user}}
    // 프론트엔드 타입에 맞게 변환
    return {
      accessToken: res.data.data.access_token,
      user: res.data.data.user
    };
  },

  // 회원가입
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', userData);
    return res.data;
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    // 백엔드 응답이 {success: true, data: user} 형태일 경우를 대비
    return res.data.data || res.data;
  },

  // 로그아웃 (클라이언트 측)
  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
};