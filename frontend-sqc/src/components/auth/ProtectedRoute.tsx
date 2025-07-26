import { ReactNode, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // 로딩 중이 아니고 인증되지 않은 경우에만 로그인 페이지로 이동
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  // 로딩 중이거나 인증되지 않은 경우 아무것도 렌더링하지 않음
  if (isLoading || !isAuthenticated) {
    return null
  }

  return <>{children}</>
}