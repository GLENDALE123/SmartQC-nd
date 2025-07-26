import { EnvironmentDebugger } from "@/components/EnvironmentDebugger"

/**
 * 대시보드 페이지
 */
export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      
      {/* 개발 환경에서만 환경변수 디버거 표시 */}
      {import.meta.env.DEV && <EnvironmentDebugger />}
    </div>
  )
} 