import ExcelImportSettings from "@/components/settings/ExcelImportSettings"
import { OrderDataTable } from "@/components/data-table/order-data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table } from "lucide-react"

/**
 * 엑셀 가져오기 전용 페이지
 * 데스크톱 환경에서 사이드바 관리자 메뉴를 통해 접근
 */
export function ExcelImportPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 엑셀 가져오기 섹션 */}
      <ExcelImportSettings />
      
      {/* 구분선 */}
      <Separator className="my-8" />
      
      {/* Order 데이터 테이블 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Table className="w-5 h-5" />
            기존 주문 데이터
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            현재 시스템에 저장된 주문 데이터를 확인하고 새로 가져올 데이터와 비교할 수 있습니다.
          </p>
        </CardHeader>
        <CardContent>
          <OrderDataTable 
            className="w-full"
            enableSearch={true}
            enableFilters={true}
            enableDateFilter={true}
            enableExport={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default ExcelImportPage