export interface User {
  id: string
  username: string
  name: string
  role: 'admin' | 'manager' | 'worker'
  position?: string // 직급
  jobTitle?: string // 직책
  inspectionType?: 'incoming' | 'process' | 'shipment' | 'all' // 검사 타입
  mainProcessLine?: string // 주 공정라인
  createdAt: string
  lastLoginAt?: string
}

export interface LoginCredentials {
  username: string
  password: string
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
}