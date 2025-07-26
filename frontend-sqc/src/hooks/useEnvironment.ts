import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { environmentApi, EnvironmentConfig } from '@/api/environment'

// 환경 설정 조회 훅
export const useEnvironment = () => {
  return useQuery({
    queryKey: ['environment'],
    queryFn: environmentApi.getConfig,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 환경 설정 업데이트 훅
export const useUpdateEnvironment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: environmentApi.updateConfig,
    onSuccess: (newConfig) => {
      queryClient.setQueryData(['environment'], newConfig)
    },
  })
}

// API 설정 업데이트 훅
export const useUpdateApiConfig = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: environmentApi.updateApiConfig,
    onSuccess: (newConfig) => {
      queryClient.setQueryData(['environment'], newConfig)
    },
  })
}

// 기능 플래그 업데이트 훅
export const useUpdateFeatures = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: environmentApi.updateFeatures,
    onSuccess: (newConfig) => {
      queryClient.setQueryData(['environment'], newConfig)
    },
  })
}

// UI 설정 업데이트 훅
export const useUpdateUISettings = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: environmentApi.updateUISettings,
    onSuccess: (newConfig) => {
      queryClient.setQueryData(['environment'], newConfig)
    },
  })
}

// 테마 변경 훅
export const useSetTheme = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: environmentApi.setTheme,
    onSuccess: (newConfig) => {
      queryClient.setQueryData(['environment'], newConfig)
    },
  })
}

// 언어 변경 훅
export const useSetLanguage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: environmentApi.setLanguage,
    onSuccess: (newConfig) => {
      queryClient.setQueryData(['environment'], newConfig)
    },
  })
}

// 환경 설정 초기화 훅
export const useResetEnvironment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: environmentApi.resetConfig,
    onSuccess: (newConfig) => {
      queryClient.setQueryData(['environment'], newConfig)
    },
  })
}

// 개별 값들을 위한 훅들
export const useEnvironmentValue = <K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] | undefined => {
  const { data } = useEnvironment()
  return data?.[key]
}

export const useApiConfig = () => {
  const { data } = useEnvironment()
  return {
    apiBaseUrl: data?.apiBaseUrl,
    apiTimeout: data?.apiTimeout,
  }
}

export const useFeatures = () => {
  const { data } = useEnvironment()
  return data?.features
}

export const useUISettings = () => {
  const { data } = useEnvironment()
  return data?.ui
}

export const useTheme = () => {
  const { data } = useEnvironment()
  return data?.ui.theme
}

export const useLanguage = () => {
  const { data } = useEnvironment()
  return data?.ui.language
} 