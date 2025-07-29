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
  }, [initializeAuth, isAuthenticated, isLoading])

  return <AppRoutes />
}

export default App
