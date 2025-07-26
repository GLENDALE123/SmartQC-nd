import { useEnvironment, useUpdateApiConfig, useUpdateFeatures, useSetTheme, useSetLanguage, useResetEnvironment } from '@/hooks/useEnvironment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

/**
 * 환경변수 디버깅 및 관리 컴포넌트
 * 개발 환경에서만 표시됩니다.
 */
export const EnvironmentDebugger = () => {
  const { data: environment, isLoading, error } = useEnvironment()
  const updateApiConfigMutation = useUpdateApiConfig()
  const updateFeaturesMutation = useUpdateFeatures()
  const setThemeMutation = useSetTheme()
  const setLanguageMutation = useSetLanguage()
  const resetEnvironmentMutation = useResetEnvironment()

  // 로딩 중이거나 에러가 있으면 표시하지 않음
  if (isLoading || error || !environment) {
    return null
  }

  const {
    apiBaseUrl,
    apiTimeout,
    appName,
    appVersion,
    environment: env,
    features,
    ui,
  } = environment

  // 개발 환경이 아니거나 디버그 모드가 비활성화된 경우 표시하지 않음
  const isDevelopment = env === 'development'
  const isDebugModeEnabled = features.enableDebugMode

  // 개발 환경이 아니거나 디버그 모드가 비활성화된 경우 표시하지 않음
  if (!isDevelopment || !isDebugModeEnabled) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          환경변수 디버거
          <Badge variant={env === 'development' ? 'default' : 'secondary'}>
            {env}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 기본 정보 */}
        <div className="space-y-2">
          <h3 className="font-semibold">기본 정보</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>앱 이름: {appName}</div>
            <div>버전: {appVersion}</div>
            <div>API URL: {apiBaseUrl}</div>
            <div>API 타임아웃: {apiTimeout}ms</div>
          </div>
        </div>

        {/* API 설정 */}
        <div className="space-y-2">
          <h3 className="font-semibold">API 설정</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => updateApiConfigMutation.mutate({ apiBaseUrl: 'http://localhost:3000/api' })}
            >
              로컬 API
            </Button>
            <Button
              size="sm"
              onClick={() => updateApiConfigMutation.mutate({ apiBaseUrl: 'https://api.smartqc.com' })}
            >
              프로덕션 API
            </Button>
          </div>
        </div>

        {/* 기능 플래그 */}
        <div className="space-y-2">
          <h3 className="font-semibold">기능 플래그</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="analytics"
                checked={features.enableAnalytics}
                onCheckedChange={(checked) => updateFeaturesMutation.mutate({ enableAnalytics: checked })}
              />
              <Label htmlFor="analytics">분석 도구</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="error-tracking"
                checked={features.enableErrorTracking}
                onCheckedChange={(checked) => updateFeaturesMutation.mutate({ enableErrorTracking: checked })}
              />
              <Label htmlFor="error-tracking">에러 추적</Label>
            </div>
          </div>
        </div>

        {/* UI 설정 */}
        <div className="space-y-2">
          <h3 className="font-semibold">UI 설정</h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setThemeMutation.mutate('light')}>
              라이트
            </Button>
            <Button size="sm" onClick={() => setThemeMutation.mutate('dark')}>
              다크
            </Button>
            <Button size="sm" onClick={() => setThemeMutation.mutate('auto')}>
              자동
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setLanguageMutation.mutate('ko')}>
              한국어
            </Button>
            <Button size="sm" onClick={() => setLanguageMutation.mutate('en')}>
              English
            </Button>
          </div>
        </div>

        {/* 현재 설정 */}
        <div className="space-y-2">
          <h3 className="font-semibold">현재 설정</h3>
          <div className="bg-muted p-3 rounded text-sm font-mono">
            <div>테마: {ui.theme}</div>
            <div>언어: {ui.language}</div>
            <div>분석: {features.enableAnalytics ? '활성' : '비활성'}</div>
            <div>에러 추적: {features.enableErrorTracking ? '활성' : '비활성'}</div>
          </div>
        </div>

        {/* 리셋 버튼 */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => resetEnvironmentMutation.mutate()}>
            환경변수 리셋
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 