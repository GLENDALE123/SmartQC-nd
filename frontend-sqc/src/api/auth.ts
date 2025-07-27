import { apiClient } from './client';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

export const authApi = {
  // 로그인
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    console.log('🌐 로그인 API 호출:', { username: credentials.username })
    
    const res = await apiClient.post('/auth/login', credentials);
    console.log('🌐 백엔드 응답 원본:', res.data)
    
    // 백엔드 응답 구조 검증
    if (!res.data || !res.data.data) {
      console.error('❌ 잘못된 응답 구조:', res.data)
      throw new Error('서버 응답 형식이 올바르지 않습니다.')
    }
    
    const { data } = res.data
    
    if (!data.access_token) {
      console.error('❌ access_token이 없습니다:', data)
      throw new Error('서버에서 토큰을 받지 못했습니다.')
    }
    
    // 백엔드 응답 구조: {success: true, data: {access_token, refresh_token, user}}
    // 프론트엔드 타입에 맞게 변환
    const authResponse = {
      accessToken: data.access_token,
      user: data.user
    };
    
    console.log('✅ 변환된 응답:', { 
      hasAccessToken: !!authResponse.accessToken,
      hasUser: !!authResponse.user,
      tokenLength: authResponse.accessToken?.length 
    })
    
    return authResponse;
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

  // 프로필 업데이트
  updateProfile: async (profileData: {
    name?: string;
    inspectionType?: string;
    processLine?: string;
    rank?: string;
    position?: string;
  }): Promise<User> => {
    const res = await apiClient.put('/auth/profile', profileData);
    return res.data.data || res.data;
  },

  // 로그아웃 (클라이언트 측)
  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
};