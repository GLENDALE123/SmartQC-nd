import { useEffect } from "react"
import { AppRoutes } from "@/routes"
import { useAuth } from "@/hooks/useAuth"

function App() {
  const { initializeAuth } = useAuth()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return <AppRoutes />
}

export default App
