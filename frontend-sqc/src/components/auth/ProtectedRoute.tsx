import { ReactNode, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { MainLayout } from "@/layouts/mainlayout/MainLayout"
import { Skeleton } from "@/components/ui/skeleton"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // 로딩 중이 아니고 인증되지 않은 경우에만 로그인 페이지로 이동
    if (!isLoading && !isAuthenticated) {
      // 현재 경로를 저장하여 로그인 후 원래 페이지로 돌아갈 수 있도록 함
      const returnUrl = location.pathname + location.search
      navigate("/login", { 
        replace: true,
        state: { returnUrl: returnUrl !== '/login' ? returnUrl : '/' }
      })
    }
  }, [isAuthenticated, isLoading, navigate, location])

  // 로딩 중일 때는 로딩 UI 표시
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center justify-center space-x-2 mt-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">인증 상태 확인 중...</span>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // 인증되지 않은 경우 아무것도 렌더링하지 않음 (리다이렉트 처리됨)
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}