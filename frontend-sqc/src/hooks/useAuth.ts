import { useAuthStore } from '@/store/authStore'
import { useMemo } from 'react'

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    setLoading,
    updateUser,
    initializeAuth,
  } = useAuthStore()

  // 권한 체크 유틸리티 함수들
  const hasRole = useMemo(() => {
    return (role: string) => {
      if (!user || !isAuthenticated) return false
      return user.role === role
    }
  }, [user, isAuthenticated])

  const hasAnyRole = useMemo(() => {
    return (roles: string[]) => {
      if (!user || !isAuthenticated) return false
      return roles.includes(user.role)
    }
  }, [user, isAuthenticated])

  const isAdmin = useMemo(() => {
    return hasRole('admin')
  }, [hasRole])

  const isManager = useMemo(() => {
    return hasRole('manager') || isAdmin
  }, [hasRole, isAdmin])

  // 사용자 정보 유틸리티
  const userDisplayName = useMemo(() => {
    if (!user) return ''
    return user.name || user.username || '사용자'
  }, [user])

  return {
    // 기본 상태
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // 액션
    login,
    logout,
    clearError,
    setLoading,
    updateUser,
    initializeAuth,
    
    // 권한 체크 유틸리티
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager,
    
    // 사용자 정보 유틸리티
    userDisplayName,
  }
}

// 개별 값들을 위한 훅들 (성능 최적화용)
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)

// 권한 체크 전용 훅들
export const useUserRole = () => {
  const user = useUser()
  const isAuthenticated = useIsAuthenticated()
  
  return useMemo(() => {
    if (!user || !isAuthenticated) return null
    return user.role
  }, [user, isAuthenticated])
}

export const useIsAdmin = () => {
  const role = useUserRole()
  return role === 'admin'
}

export const useIsManager = () => {
  const role = useUserRole()
  return role === 'manager' || role === 'admin'
}