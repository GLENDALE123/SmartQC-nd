// 사용자 역할 타입
export type UserRole = 'admin' | 'manager' | 'worker'

// 검사 타입
export type InspectionType = 'incoming' | 'process' | 'shipment' | 'all'

// 토큰 저장 방식
export type TokenStorage = 'localStorage' | 'sessionStorage'

export interface User {
  id: string
  username: string
  name: string
  role: UserRole
  rank?: string // 직급 (예: 사원, 대리, 과장, 차장, 부장 등)
  position?: string // 직책 (예: 팀장, 팀원, 검사원, 관리자 등)
  inspectionType?: InspectionType // 검사 타입
  processLine?: string // 공정라인 정보
  authType?: string // 인증 타입
  email?: string // 이메일
  phone?: string // 전화번호
  department?: string // 부서
  isActive: boolean // 활성 상태
  createdAt: string
  updatedAt?: string
  lastLoginAt?: string
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean // 로그인 유지 옵션
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginResponse {
  user: User
  access_token: string
  refresh_token?: string
  expires_in?: number // 토큰 만료 시간 (초)
}

export interface RefreshTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
}

// 권한 체크를 위한 유틸리티 타입
export interface PermissionConfig {
  roles: UserRole[]
  inspectionTypes?: InspectionType[]
  departments?: string[]
}

// 인증 에러 타입
export interface AuthError {
  code: string
  message: string
  details?: any
}

// 토큰 정보
export interface TokenInfo {
  token: string
  expiresAt?: number
  refreshToken?: string
}

// 인증 설정
export interface AuthConfig {
  tokenStorage: TokenStorage
  autoRefresh: boolean
  refreshThreshold: number // 토큰 갱신 임계값 (분)
  maxRetries: number // 최대 재시도 횟수
}