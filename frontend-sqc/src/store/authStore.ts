import { create } from 'zustand'
import { authApi } from '@/api/auth'
import type { User, LoginRequest } from '@/types'

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
  updateUser: (userData: Partial<User>) => Promise<void>
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
        try {
          // localStorage 저장 시도
          localStorage.setItem('authToken', response.accessToken)
          const savedToken = localStorage.getItem('authToken')
          
          if (!savedToken) {
            // localStorage 실패 시 sessionStorage 사용
            sessionStorage.setItem('authToken', response.accessToken)
            const sessionToken = sessionStorage.getItem('authToken')
            
            if (!sessionToken) {
              throw new Error('localStorage와 sessionStorage 모두 토큰 저장에 실패했습니다.')
            }
          }
        } catch (storageError) {
          // 브라우저 저장소 상태 진단
          try {
            const testKey = 'storage_test_' + Date.now()
            localStorage.setItem(testKey, 'test')
            localStorage.removeItem(testKey)
          } catch (testError) {
            throw new Error('브라우저의 로컬 저장소가 비활성화되어 있습니다. 브라우저 설정을 확인해주세요.')
          }
          
          throw new Error('토큰 저장에 실패했습니다: ' + (storageError instanceof Error ? storageError.message : 'Unknown error'))
        }
      } else {
        throw new Error('서버에서 토큰을 받지 못했습니다.')
      }
      
      // 사용자 정보 조회
      const user = await authApi.getCurrentUser()
      
      // 사용자 정보도 localStorage에 저장
      try {
        const userDataToStore = JSON.stringify(user)
        localStorage.setItem('user', userDataToStore)
      } catch (storageError) {
        // 사용자 정보 저장 실패는 치명적이지 않으므로 계속 진행
      }
      
      set((state) => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }))
    } catch (error: any) {
      // 실패 시 기존 토큰 정리
      try {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      } catch (cleanupError) {
        // 정리 실패는 무시
      }
      
      set({
        isLoading: false,
        error: error?.response?.data?.message || error?.message || '로그인 중 오류가 발생했습니다.'
      })
    }
  },
      
  logout: () => {
    // 모든 저장소에서 토큰 제거
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('user')
    
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
      
  updateUser: async (userData: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;

    try {
      set({ isLoading: true, error: null });
      
      // API 호출하여 백엔드 업데이트
      const updatedUser = await authApi.updateProfile({
        name: userData.name,
        inspectionType: userData.inspectionType,
        processLine: userData.processLine,
        rank: userData.rank,
        position: userData.position,
      });

      // 로컬 상태 업데이트
      set(() => ({
        user: updatedUser,
        isLoading: false,
        error: null
      }));

      // localStorage에도 업데이트된 사용자 정보 저장
      try {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (storageError) {
        console.warn('사용자 정보 저장 실패:', storageError);
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error?.response?.data?.message || error?.message || '프로필 업데이트 중 오류가 발생했습니다.'
      });
      throw error;
    }
  },
      
  initializeAuth: async () => {
    set({ isLoading: true })
    
    // localStorage 접근 안전성 확인
    try {
      const testKey = 'init_test_' + Date.now()
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false, user: null })
      return
    }
    
    // localStorage와 sessionStorage 모두 확인
    let token = null
    let savedUser = null
    let storageType: 'localStorage' | 'sessionStorage' = 'localStorage'
    
    try {
      token = localStorage.getItem('authToken')
      savedUser = localStorage.getItem('user')
    } catch (error) {
      // localStorage 읽기 실패 시 sessionStorage 시도
      try {
        token = sessionStorage.getItem('authToken')
        savedUser = sessionStorage.getItem('user')
        storageType = 'sessionStorage'
      } catch (sessionError) {
        // 모든 저장소 접근 실패
        set({ isLoading: false, isAuthenticated: false, user: null })
        return
      }
    }
    
    if (!token) {
      // 토큰이 없으면 저장된 사용자 정보도 정리
      try {
        localStorage.removeItem('user')
        sessionStorage.removeItem('user')
      } catch (error) {
        // 저장소 정리 실패 시 무시
      }
      set({ isLoading: false, isAuthenticated: false, user: null })
      return
    }
    
    // 저장된 사용자 정보가 있으면 먼저 복원 (빠른 복원)
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
        return
      } catch (parseError) {
        // 사용자 정보 파싱 실패 시 저장소에서 제거
        try {
          if (storageType === 'localStorage') {
            localStorage.removeItem('user')
          } else {
            sessionStorage.removeItem('user')
          }
        } catch (cleanupError) {
          // 정리 실패 시 무시
        }
      }
    }
    
    // 토큰은 있지만 사용자 정보가 없거나 파싱에 실패한 경우 API 호출
    try {
      const user = await authApi.getCurrentUser()
      
      // 사용자 정보를 해당 저장소에 저장
      try {
        const userDataToStore = JSON.stringify(user)
        if (storageType === 'localStorage') {
          localStorage.setItem('user', userDataToStore)
        } else {
          sessionStorage.setItem('user', userDataToStore)
        }
      } catch (storageError) {
        // 사용자 정보 저장 실패는 치명적이지 않으므로 계속 진행
        console.warn('사용자 정보 저장 실패:', storageError)
      }
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
    } catch (apiError) {
      // API 호출 실패 시 모든 인증 정보 정리
      try {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        sessionStorage.removeItem('authToken')
        sessionStorage.removeItem('user')
      } catch (cleanupError) {
        // 정리 실패 시 무시
      }
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: null 
      })
    }
  }
}))