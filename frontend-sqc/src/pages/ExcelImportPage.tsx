import { OrderDataTable } from "@/components/data-table/order-data-table"

/**
 * 엑셀 가져오기 전용 페이지
 * 데스크톱 환경에서 사이드바 관리자 메뉴를 통해 접근
 */
export function ExcelImportPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Order 데이터 테이블 섹션 */}
      <OrderDataTable 
        className="w-full"
        enableSearch={true}
        enableFilters={true}
        enableDateFilter={true}
        enableExport={true}
      />
    </div>
  )
}

export default ExcelImportPage