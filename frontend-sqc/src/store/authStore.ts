import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginRequest, AuthResponse } from '@/types'
import { authApi } from '@/api/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  updateUser: (userData: Partial<User>) => void
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })
        
        try {
          // 실제 API 호출
          const response = await authApi.login({
            username: credentials.username,
            password: credentials.password
          })
          
          // 토큰을 localStorage에 저장
          if (response.accessToken) {
            localStorage.setItem('authToken', response.accessToken)
          }
          
          // 사용자 정보 조회
          const user = await authApi.getCurrentUser()
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            isLoading: false,
            error: error?.response?.data?.message || error?.message || '로그인 중 오류가 발생했습니다.'
          })
        }
      },
      
      logout: () => {
        // 토큰 제거
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        
        // API 로그아웃 호출 (선택적)
        authApi.logout()
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
      },
      
      clearError: () => {
        set({ error: null })
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
      
      updateUser: (userData: Partial<User>) => {
        set(state => ({
          user: state.user ? { ...state.user, ...userData } : null
        }))
      },
      
      initializeAuth: async () => {
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false })
          return
        }
        
        try {
          set({ isLoading: true })
          const user = await authApi.getCurrentUser()
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          // 토큰이 유효하지 않은 경우 제거
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)