import { useEffect } from "react"
import { AppRoutes } from "@/routes"
import { useAuth } from "@/hooks/useAuth"

function App() {
  const { initializeAuth } = useAuth()

  useEffect(() => {
    console.log('🚀 App 시작 - initializeAuth 호출')
    initializeAuth()
  }, [])

  return <AppRoutes />
}

export default App
