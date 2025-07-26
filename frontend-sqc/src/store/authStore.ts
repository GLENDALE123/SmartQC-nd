import { create } from 'zustand'
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

export const useAuthStore = create<AuthStore>()((set, get) => ({
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
          
          // 사용자 정보도 localStorage에 저장
          localStorage.setItem('user', JSON.stringify(user))
          
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
        console.log('🔄 initializeAuth 시작')
        set({ isLoading: true })
        
        const token = localStorage.getItem('authToken')
        const savedUser = localStorage.getItem('user')
        
        console.log('localStorage 상태:', { 
          token: token ? '존재함' : '없음', 
          user: savedUser ? '존재함' : '없음' 
        })
        
        if (!token) {
          console.log('❌ 토큰 없음, 로그아웃 상태로 설정')
          localStorage.removeItem('user')
          set({ isLoading: false, isAuthenticated: false, user: null })
          return
        }
        
        // 저장된 사용자 정보가 있으면 먼저 복원
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser)
            console.log('✅ localStorage에서 사용자 정보 복원:', user)
            set({ user, isAuthenticated: true, isLoading: false, error: null })
            return
          } catch (error) {
            console.error('❌ 저장된 사용자 정보 파싱 실패:', error)
            localStorage.removeItem('user')
          }
        }
        
        // 토큰은 있지만 사용자 정보가 없으면 API 호출
        try {
          console.log('🔍 현재 사용자 정보 조회 시도')
          const user = await authApi.getCurrentUser()
          console.log('✅ 사용자 정보 조회 성공:', user)
          localStorage.setItem('user', JSON.stringify(user))
          set({ user, isAuthenticated: true, isLoading: false, error: null })
        } catch (error) {
          console.error('❌ 사용자 정보 조회 실패:', error)
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          set({ user: null, isAuthenticated: false, isLoading: false, error: null })
        }
      }
  })
)