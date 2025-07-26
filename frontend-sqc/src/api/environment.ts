// 환경변수 타입 정의
export interface EnvironmentConfig {
  // API 관련
  apiBaseUrl: string
  apiTimeout: number
  
  // 앱 설정
  appName: string
  appVersion: string
  environment: 'development' | 'staging' | 'production'
  
  // 외부 서비스
  googleAnalyticsId?: string
  sentryDsn?: string
  
  // 기능 플래그
  features: {
    enableDebugMode: boolean
    enableAnalytics: boolean
    enableErrorTracking: boolean
  }
  
  // UI 설정
  ui: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    timezone: string
  }
}

// 초기 환경 설정
const getInitialEnvironment = (): EnvironmentConfig => ({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '5000'),
  appName: import.meta.env.VITE_APP_NAME || 'SmartQC',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: (import.meta.env.VITE_NODE_ENV as EnvironmentConfig['environment']) || 'development',
  googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  features: {
    enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableErrorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
  },
  ui: {
    theme: (import.meta.env.VITE_THEME as EnvironmentConfig['ui']['theme']) || 'auto',
    language: import.meta.env.VITE_LANGUAGE || 'ko',
    timezone: import.meta.env.VITE_TIMEZONE || 'Asia/Seoul',
  },
})

// 로컬 스토리지에서 환경 설정 로드
const loadEnvironmentFromStorage = (): EnvironmentConfig => {
  try {
    const saved = localStorage.getItem('environment-config')
    if (saved) {
      return { ...getInitialEnvironment(), ...JSON.parse(saved) }
    }
  } catch (error) {
    console.error('Failed to load environment config from storage:', error)
  }
  return getInitialEnvironment()
}

// 환경 설정을 로컬 스토리지에 저장
const saveEnvironmentToStorage = (config: EnvironmentConfig) => {
  try {
    localStorage.setItem('environment-config', JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save environment config to storage:', error)
  }
}

// 현재 환경 설정 (싱글톤)
let currentEnvironment = loadEnvironmentFromStorage()

// API 함수들
export const environmentApi = {
  // 환경 설정 조회
  getConfig: async (): Promise<EnvironmentConfig> => {
    // 실제로는 API 호출이지만 여기서는 로컬 스토리지 사용
    await new Promise(resolve => setTimeout(resolve, 100))
    return currentEnvironment
  },

  // 환경 설정 업데이트
  updateConfig: async (updates: Partial<EnvironmentConfig>): Promise<EnvironmentConfig> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    currentEnvironment = { ...currentEnvironment, ...updates }
    saveEnvironmentToStorage(currentEnvironment)
    return currentEnvironment
  },

  // API 설정 업데이트
  updateApiConfig: async (apiConfig: { apiBaseUrl?: string; apiTimeout?: number }): Promise<EnvironmentConfig> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    currentEnvironment = { ...currentEnvironment, ...apiConfig }
    saveEnvironmentToStorage(currentEnvironment)
    return currentEnvironment
  },

  // 기능 플래그 업데이트
  updateFeatures: async (features: Partial<EnvironmentConfig['features']>): Promise<EnvironmentConfig> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    currentEnvironment = {
      ...currentEnvironment,
      features: { ...currentEnvironment.features, ...features }
    }
    saveEnvironmentToStorage(currentEnvironment)
    return currentEnvironment
  },

  // UI 설정 업데이트
  updateUISettings: async (uiSettings: Partial<EnvironmentConfig['ui']>): Promise<EnvironmentConfig> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    currentEnvironment = {
      ...currentEnvironment,
      ui: { ...currentEnvironment.ui, ...uiSettings }
    }
    saveEnvironmentToStorage(currentEnvironment)
    return currentEnvironment
  },

  // 테마 변경
  setTheme: async (theme: EnvironmentConfig['ui']['theme']): Promise<EnvironmentConfig> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    currentEnvironment = {
      ...currentEnvironment,
      ui: { ...currentEnvironment.ui, theme }
    }
    saveEnvironmentToStorage(currentEnvironment)
    return currentEnvironment
  },

  // 언어 변경
  setLanguage: async (language: string): Promise<EnvironmentConfig> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    currentEnvironment = {
      ...currentEnvironment,
      ui: { ...currentEnvironment.ui, language }
    }
    saveEnvironmentToStorage(currentEnvironment)
    return currentEnvironment
  },

  // 환경 설정 초기화
  resetConfig: async (): Promise<EnvironmentConfig> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    currentEnvironment = getInitialEnvironment()
    localStorage.removeItem('environment-config')
    return currentEnvironment
  },
} 