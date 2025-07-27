import { useEffect } from "react"
import { AppRoutes } from "@/routes"
import { useAuth } from "@/hooks/useAuth"

function App() {
  const { initializeAuth, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // 로딩 중이거나 이미 인증된 상태라면 초기화 스킵
    if (isLoading || isAuthenticated) {
      return
    }
    
    // 인증 상태 초기화
    initializeAuth()
  }, [initializeAuth]) // 의존성 배열에서 isAuthenticated, isLoading 제거하여 무한 루프 방지

  return <AppRoutes />
}

export default App
