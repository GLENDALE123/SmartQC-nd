import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // 네트워크 연결 오류 (ECONNREFUSED, ENOTFOUND 등)인 경우 재시도 안함
        if (error?.code === 'ECONNREFUSED' || 
            error?.code === 'ENOTFOUND' || 
            error?.code === 'NETWORK_ERROR' ||
            error?.message?.includes('ECONNREFUSED') ||
            error?.message?.includes('Network Error')) {
          return false;
        }
        
        // 5xx 서버 오류는 최대 2번 재시도
        if (error?.response?.status >= 500) {
          return failureCount < 2;
        }
        
        // 4xx 클라이언트 오류는 재시도 안함
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        
        // 기타 오류는 최대 1번 재시도
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분 (이전 cacheTime)
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // 네트워크 연결 오류인 경우 재시도 안함
        if (error?.code === 'ECONNREFUSED' || 
            error?.code === 'ENOTFOUND' || 
            error?.code === 'NETWORK_ERROR' ||
            error?.message?.includes('ECONNREFUSED') ||
            error?.message?.includes('Network Error')) {
          return false;
        }
        
        // 5xx 서버 오류만 재시도 (최대 1번)
        if (error?.response?.status >= 500) {
          return failureCount < 1;
        }
        
        return false;
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
