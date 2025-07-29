// Order 테이블 전용 DataTable 컴포넌트

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { useSearchParams } from "react-router-dom"
import { DateRange } from "react-day-picker"

import { Order } from "@/types/models"
import { useDataTable } from "@/hooks/use-data-table"
import { useOrders } from "@/hooks/use-orders"
import { useFilterOptions } from "@/hooks/use-filter-options"
import { DataTable } from "./data-table"
import { DataTableToolbar } from "./data-table-toolbar"

import { DataTableSkeleton } from "./data-table-skeleton"
import { orderColumns, orderSearchableFields, orderFilterableFields } from "./columns/order-columns"
import type { DataTableFilterField } from "@/types/data-table"
import { Cross2Icon, MagnifyingGlassIcon, DownloadIcon, ReloadIcon } from "@radix-ui/react-icons"
import { TableIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableColumnsVisibility } from "./data-table-columns-visibility"
import { DateRangePicker } from "@/components/date-range-picker"
import { TableInstanceProvider } from "./table-instance-provider"
import { ExportDialog } from "./export-dialog"
import { Upload, FileSpreadsheet } from "lucide-react"
import { uploadExcel } from "@/api/excel-upload"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"



// OrderDataTable 컴포넌트 프롭스
export interface OrderDataTableProps {
  className?: string
  pageSize?: number
  enableSearch?: boolean
  enableFilters?: boolean
  enableDateFilter?: boolean
  enableExport?: boolean
}

export const OrderDataTable = memo(function OrderDataTable({
  className,
  pageSize: defaultPageSize = 20,
  enableSearch = true,
  enableFilters = true,
  enableDateFilter = true,
  enableExport = true,
}: OrderDataTableProps) {
  const [searchParams] = useSearchParams()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [globalFilter, setGlobalFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // URL 파라미터에서 페이지 사이즈 읽기 (없으면 기본값 사용)
  const pageSize = Number(searchParams.get("per_page")) || defaultPageSize
  
  // URL 파라미터에서 정렬 정보 읽기
  const sortParam = searchParams.get("sort")

  // API 쿼리 파라미터 구성 (디바운스 제거 - 툴바에서 처리)
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      pageSize,
      search: globalFilter || undefined, // 직접 사용
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    }

    // 정렬 파라미터 추가
    if (sortParam) {
      params.sort = sortParam
    }

    // 날짜 범위 필터 추가
    if (dateRange?.from || dateRange?.to) {
      params.dateRange = {
        from: dateRange.from || undefined,
        to: dateRange.to || undefined,
        field: 'orderDate', // year/month/day 조합 기준 필터링
      }
    }

    return params
  }, [currentPage, pageSize, globalFilter, filters, dateRange, sortParam]) // globalFilter 직접 사용

  // 실제 API 호출
  const {
    orders,
    loading,
    error: apiError,
    refresh,
    totalPages,
  } = useOrders(queryParams, {
    enabled: true,
    staleTime: 60 * 1000, // 캐시 시간을 60초로 증가
    onError: (error) => {
      console.error('Order data fetch error:', error)
    },
  })

  // 필터 옵션 조회 (전체 데이터 기준)
  const {
    data: filterOptions,
    isLoading: filterOptionsLoading,
    error: filterOptionsError
  } = useFilterOptions()

  // 검색어가 변경되면 페이지를 1로 리셋
  useEffect(() => {
    if (globalFilter && currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [globalFilter, currentPage])

  const error = apiError?.message || null

  // 컬럼 라벨 정의 (컬럼 ID와 표시할 한글 라벨 매핑)
  const columnLabels = useMemo(() => ({
    col0: 'ID',
    orderDate: '날짜',
    category: '분류',
    finalorderNumber: '발주번호',
    orderNumber: '열1',
    code: '코드',
    customer: '발주처',
    productName: '제품명',
    partName: '부속명',
    quantity: '발주수량',
    specification: '사양',
    status: '진행상태',
    shippingDate: '출하일',
    manager: '담당',
    unitPrice: '단가',
    orderAmount: '발주금액',
    actions: '액션',
  }), [])

  // 필터 옵션 동적 생성 (전체 데이터 기준)
  const filterableColumns = useMemo(() => {
    if (!filterOptions) return []
    
    const statusField = orderFilterableFields.find(f => f.id === 'status')
    const customerField = orderFilterableFields.find(f => f.id === 'customer')
    const productNameField = orderFilterableFields.find(f => f.id === 'productName')
    const partNameField = orderFilterableFields.find(f => f.id === 'partName')
    
    const result = []
    
    // 진행상태 필터 (고정 옵션 사용)
    if (statusField) {
      result.push({
        id: statusField.id,
        title: statusField.title,
        options: statusField.options.map(opt => ({ value: opt.value, label: opt.label }))
      })
    }
    
    // 발주처 필터 (전체 데이터에서 동적 생성)
    if (customerField && filterOptions.customer.length > 0) {
      result.push({
        id: customerField.id,
        title: customerField.title,
        options: filterOptions.customer.map(customer => ({ value: customer, label: customer }))
      })
    }
    
    // 제품명 필터 (전체 데이터에서 동적 생성)
    if (productNameField && filterOptions.productName.length > 0) {
      result.push({
        id: productNameField.id,
        title: productNameField.title,
        options: filterOptions.productName.map(productName => ({ value: productName, label: productName }))
      })
    }
    
    // 부속명 필터 (전체 데이터에서 동적 생성)
    if (partNameField && filterOptions.partName.length > 0) {
      result.push({
        id: partNameField.id,
        title: partNameField.title,
        options: filterOptions.partName.map(partName => ({ value: partName, label: partName }))
      })
    }
    
    return result
  }, [filterOptions])

  // 검색 및 필터 필드 구성
  const filterFields: DataTableFilterField<Order>[] = useMemo(() => [
    // 검색 필드
    ...orderSearchableFields.map(field => ({
      label: getFieldLabel(field),
      value: field as keyof Order,
    })),
    // 필터 필드 (옵션이 있는 것들만)
    ...filterableColumns
      .filter(col => col.options.length > 0)
      .map(col => ({
        label: col.title,
        value: col.id as keyof Order,
        options: col.options,
      })),
  ], [filterableColumns])

  // 데이터 테이블 훅 사용 (서버 사이드 페이지네이션)
  const { table } = useDataTable({
    data: orders,
    columns: orderColumns,
    pageCount: totalPages,
    defaultPerPage: pageSize,
    defaultSort: "col0.desc",
    filterFields,
  })

  // 초기 컬럼 가시성 설정 (ID, 열1, 코드 컬럼 숨김)
  useEffect(() => {
    table.setColumnVisibility({
      col0: false,        // ID 컬럼 숨김
      orderNumber: false, // 열1 컬럼 숨김
      code: false,        // 코드 컬럼 숨김
    })
  }, [table])

  // 페이지 변경 핸들러
  useEffect(() => {
    const pagination = table.getState().pagination
    if (pagination.pageIndex + 1 !== currentPage) {
      setCurrentPage(pagination.pageIndex + 1)
    }
  }, [table.getState().pagination.pageIndex, currentPage])

  // 필터 변경 핸들러
  useEffect(() => {
    const columnFilters = table.getState().columnFilters
    const newFilters: Record<string, any> = {}
    
    columnFilters.forEach(filter => {
      if (filter.value !== undefined && filter.value !== null) {
        newFilters[filter.id] = filter.value
      }
    })
    
    setFilters(newFilters)
  }, [table.getState().columnFilters])

  // 새로고침 핸들러
  const handleRefresh = useCallback(async () => {
    await refresh()
  }, [refresh])

  // 내보내기 핸들러
  const handleExport = useCallback(() => {
    setShowExportDialog(true)
  }, [])

  // 엑셀 업로드 핸들러
  const handleUpload = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls'
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsUploading(true)
      setUploadProgress(0)

      try {
        await uploadExcel(file, (progress) => {
          setUploadProgress(progress)
        })
        
        toast.success('엑셀 파일이 성공적으로 업로드되었습니다.')
        await refresh() // 데이터 새로고침
      } catch (error) {
        console.error('Excel upload error:', error)
        toast.error('엑셀 업로드 중 오류가 발생했습니다.')
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    }
    input.click()
  }, [refresh])

  // 글로벌 필터 변경 핸들러 (메모이제이션)
  const handleGlobalFilterChange = useCallback((value: string) => {
    setGlobalFilter(value)
  }, [])

  // 날짜 범위 변경 핸들러 (메모이제이션)
  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range)
  }, [])

  // 로딩 상태 구분 (디바운스 제거로 단순화)
  const isInitialLoading = loading && orders.length === 0 && !globalFilter && Object.keys(filters).length === 0
  const isSearchLoading = loading && (orders.length > 0 || globalFilter || Object.keys(filters).length > 0)

  // 초기 로딩 상태 (데이터가 없고 검색/필터도 없는 경우)
  if (isInitialLoading) {
    return <DataTableSkeleton columnCount={orderColumns.length} rowCount={10} />
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        <div className="text-center">
          <p className="text-lg font-medium">오류 발생</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={handleRefresh}
            className="mt-2"
            disabled={loading}
          >
            {loading ? (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ReloadIcon className="mr-2 h-4 w-4" />
            )}
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <TableInstanceProvider table={table}>
        <DataTable table={table}>
          <DataTableToolbar
            table={table}
            onRefresh={enableSearch ? handleRefresh : undefined}
            onUpload={handleUpload}
            onExport={enableExport ? handleExport : undefined}
            searchPlaceholder="주문 검색..."
            filterableColumns={enableFilters ? filterableColumns.filter(col => col.options.length > 0) : []}
            dateRange={dateRange}
            onDateRangeChange={enableDateFilter ? handleDateRangeChange : undefined}
            showDateFilter={enableDateFilter}
            dateFilterPlaceholder="날짜 범위 선택"
            isLoading={isSearchLoading} // 검색 로딩 상태만 전달
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            globalFilter={globalFilter}
            onGlobalFilterChange={enableSearch ? handleGlobalFilterChange : () => {}}
            columnLabels={columnLabels}
          />
        </DataTable>
      </TableInstanceProvider>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        data={orders}
        selectedRows={table.getFilteredSelectedRowModel().rows.map(row => row.original)}
        filters={filters}
        onExport={() => {
          // 내보내기 완료 후 처리
          console.log('Export completed');
        }}
      />
    </div>
  )
})

// 필드 라벨 매핑 함수
function getFieldLabel(field: typeof orderSearchableFields[number]): string {
  const labelMap = {
    finalorderNumber: '발주번호',
    customer: '발주처',
    productName: '제품명',
    partName: '부속명',
    code: '코드',
  } as const

  return labelMap[field] || field
}

// 기본 export
export default OrderDataTable