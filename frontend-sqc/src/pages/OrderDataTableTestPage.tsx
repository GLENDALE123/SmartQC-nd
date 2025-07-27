import { useState } from "react"
import { OrderDataTable } from "@/components/data-table/order-data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, Database, Filter, Search, Download, Eye } from "lucide-react"

export default function OrderDataTableTestPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const features = [
    {
      icon: <Search className="h-4 w-4" />,
      title: "전역 검색",
      description: "모든 컬럼에서 텍스트 검색"
    },
    {
      icon: <Filter className="h-4 w-4" />,
      title: "고급 필터링",
      description: "상태, 담당자, 날짜 범위 필터"
    },
    {
      icon: <Eye className="h-4 w-4" />,
      title: "컬럼 가시성",
      description: "원하는 컬럼만 표시/숨김"
    },
    {
      icon: <Download className="h-4 w-4" />,
      title: "데이터 내보내기",
      description: "CSV/Excel 형식으로 내보내기"
    }
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order DataTable Test</h1>
          <p className="text-muted-foreground mt-2">
            shadcn-view-table 기반 Order DataTable 컴포넌트 테스트 환경
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Test Environment</Badge>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            DataTable 기능 개요
          </CardTitle>
          <CardDescription>
            이 테스트 페이지에서 확인할 수 있는 주요 기능들
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-shrink-0 p-2 bg-primary/10 rounded-md">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>테스트 가이드</CardTitle>
          <CardDescription>
            다음 기능들을 테스트해보세요 (총 50개의 Mock 데이터 제공)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">기본 기능</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 테이블 데이터 로딩 및 표시 (50개 Order 레코드)</li>
                <li>• 컬럼 정렬 (클릭으로 오름차순/내림차순)</li>
                <li>• 페이지네이션 (페이지 크기 변경 포함)</li>
                <li>• 행 선택 (개별/전체 선택)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">고급 기능</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 전역 검색 (발주번호, 고객명, 제품명 등)</li>
                <li>• 상태별 필터링 (진행중, 완료, 대기, 보류, 취소)</li>
                <li>• 날짜 범위 필터링 (생성일 기준)</li>
                <li>• 컬럼 가시성 토글</li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">테스트 시나리오</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-muted/50 rounded-lg">
                <h5 className="font-medium text-blue-600 mb-1">검색 테스트</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "삼성전자" 검색</li>
                  <li>• "ORD-2024-001" 검색</li>
                  <li>• "스마트폰" 검색</li>
                </ul>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h5 className="font-medium text-green-600 mb-1">필터 테스트</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 상태: "진행중" 필터</li>
                  <li>• 상태: "완료" 필터</li>
                  <li>• 날짜 범위 선택</li>
                </ul>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h5 className="font-medium text-purple-600 mb-1">정렬 테스트</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 발주번호 정렬</li>
                  <li>• 발주금액 정렬</li>
                  <li>• 생성일 정렬</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>참고:</strong> 이 테스트 환경은 실제 API 대신 Mock 데이터를 사용합니다. 
              모든 기능은 클라이언트 사이드에서 시뮬레이션됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">50</p>
                <p className="text-xs text-muted-foreground">총 주문 수</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">상태 유형</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">20+</p>
                <p className="text-xs text-muted-foreground">고객사</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">15+</p>
                <p className="text-xs text-muted-foreground">표시 컬럼</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>Order DataTable</CardTitle>
          <CardDescription>
            실제 Order 데이터 구조를 기반으로 한 DataTable 컴포넌트 (Prisma 스키마 기반)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderDataTable key={refreshKey} className="w-full" />
        </CardContent>
      </Card>
    </div>
  )
}