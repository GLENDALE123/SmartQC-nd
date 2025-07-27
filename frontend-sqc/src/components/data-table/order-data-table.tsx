// Order 테이블 전용 DataTable 컴포넌트

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { DateRange } from "react-day-picker"

import { Order } from "@/types/models"
import { useDataTable } from "@/hooks/use-data-table"
import { useOrders } from "@/hooks/use-orders"
import { useDebounce } from "@/hooks/use-debounce"
import { DataTable } from "./data-table"

import { DataTableSkeleton } from "./data-table-skeleton"
import { orderColumns, orderSearchableFields, orderFilterableFields } from "./columns/order-columns"
import type { DataTableFilterField } from "@/types/data-table"
import { Cross2Icon, MagnifyingGlassIcon, DownloadIcon, ReloadIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableColumnsVisibility } from "./data-table-columns-visibility"
import { DateRangePicker } from "@/components/date-range-picker"
import { TableInstanceProvider } from "./table-instance-provider"
import { ExportDialog } from "./export-dialog"

// OrderDataTable 전용 툴바 컴포넌트
interface OrderDataTableToolbarProps<TData> {
  table: Table<TData>
  onRefresh?: () => void
  onExport?: () => void
  searchPlaceholder?: string
  filterableColumns?: Array<{
    id: string
    title: string
    options: Array<{ label: string; value: string }>
  }>
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange | undefined) => void
  showDateFilter?: boolean
  dateFilterPlaceholder?: string
  isLoading?: boolean
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  columnLabels?: Record<string, string>
}

function OrderDataTableToolbar<TData>({
  table,
  onRefresh,
  onExport,
  searchPlaceholder = "검색...",
  filterableColumns = [],
  dateRange,
  onDateRangeChange,
  showDateFilter = false,
  dateFilterPlaceholder = "날짜 범위 선택",
  isLoading = false,
  globalFilter,
  onGlobalFilterChange,
  columnLabels,
}: OrderDataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || dateRange?.from || dateRange?.to || globalFilter
  
  // 검색 중인지 확인 (입력값과 실제 검색어가 다른 경우)
  const isSearching = globalFilter !== "" && isLoading

  const handleResetFilters = () => {
    table.resetColumnFilters()
    onDateRangeChange?.(undefined)
    onGlobalFilterChange("")
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative">
          <MagnifyingGlassIcon className={`absolute left-2.5 top-2.5 h-4 w-4 ${isSearching ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(event) => onGlobalFilterChange(event.target.value)}
            className={`h-8 w-[150px] pl-8 lg:w-[250px] ${isSearching ? 'border-primary' : ''}`}
            disabled={isLoading && !isSearching} // 검색 중이 아닌 로딩 상태에서만 비활성화
          />
          {isSearching && (
            <div className="absolute right-2.5 top-2.5">
              <ReloadIcon className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
        </div>
        
        {/* Date Range Filter */}
        {showDateFilter && onDateRangeChange && (
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            placeholder={dateFilterPlaceholder}
            triggerSize="sm"
            triggerClassName="h-8 w-[200px]"
          />
        )}
        
        {/* Status Filter - Simplified for now */}
        {filterableColumns.find(col => col.id === 'status' && col.options.length > 0) && (
          <select
            className="h-8 px-3 py-1 text-sm border border-input bg-background rounded-md"
            value={(table.getColumn('status')?.getFilterValue() as string[])?.join(',') || ''}
            onChange={(e) => {
              const value = e.target.value
              table.getColumn('status')?.setFilterValue(value ? [value] : undefined)
            }}
          >
            <option value="">모든 상태</option>
            {filterableColumns.find(col => col.id === 'status')?.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        
        {/* Reset Filters Button */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="h-8 px-2 lg:px-3"
            disabled={isLoading}
          >
            초기화
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Refresh Button */}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8"
            disabled={isLoading}
          >
            {isLoading ? (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ReloadIcon className="mr-2 h-4 w-4" />
            )}
            새로고침
          </Button>
        )}
        
        {/* Export Button */}
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-8"
            disabled={isLoading}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            내보내기
          </Button>
        )}
        
        {/* Column Visibility */}
        <DataTableColumnsVisibility columnLabels={columnLabels} />
      </div>
    </div>
  )
}

// OrderDataTable 컴포넌트 프롭스
export interface OrderDataTableProps {
  className?: string
  pageSize?: number
  enableSearch?: boolean
  enableFilters?: boolean
  enableDateFilter?: boolean
  enableExport?: boolean
}

export function OrderDataTable({
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

  // 검색어 디바운싱 적용 (1000ms 지연으로 빠른 응답성 제공)
  const debouncedGlobalFilter = useDebounce(globalFilter, 1000)
  
  // 검색 중인지 확인 (현재 입력값과 디바운싱된 값이 다른 경우)
  const isSearching = globalFilter !== debouncedGlobalFilter && globalFilter !== ""

  // URL 파라미터에서 페이지 사이즈 읽기 (없으면 기본값 사용)
  const pageSize = Number(searchParams.get("per_page")) || defaultPageSize
  
  // URL 파라미터에서 정렬 정보 읽기
  const sortParam = searchParams.get("sort")

  // API 쿼리 파라미터 구성 (디바운싱된 검색어 사용)
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      pageSize,
      search: debouncedGlobalFilter || undefined, // 디바운싱된 검색어 사용
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
  }, [currentPage, pageSize, debouncedGlobalFilter, filters, dateRange, sortParam]) // debouncedGlobalFilter로 변경

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

  // 검색어가 변경되면 페이지를 1로 리셋
  useEffect(() => {
    if (debouncedGlobalFilter !== globalFilter) {
      // 아직 디바운싱 중이므로 페이지 리셋하지 않음
      return
    }
    
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedGlobalFilter]) // globalFilter가 아닌 debouncedGlobalFilter 사용

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

  // 필터 옵션 동적 생성
  const filterableColumns = useMemo(() => {
    const statusField = orderFilterableFields.find(f => f.id === 'status')
    const categoryField = orderFilterableFields.find(f => f.id === 'category')
    const managerField = orderFilterableFields.find(f => f.id === 'manager')
    
    const result = []
    
    // 상태 필터
    if (statusField) {
      result.push({
        id: statusField.id,
        title: statusField.title,
        options: statusField.options.map(opt => ({ value: opt.value, label: opt.label }))
      })
    }
    
    // 분류 필터 (실제 데이터에서 동적 생성)
    if (categoryField && orders.length > 0) {
      const categories = Array.from(new Set(orders.map(item => item.category).filter(Boolean)))
      result.push({
        id: categoryField.id,
        title: categoryField.title,
        options: categories.map(cat => ({ value: cat!, label: cat! }))
      })
    }
    
    // 담당자 필터 (실제 데이터에서 동적 생성)
    if (managerField && orders.length > 0) {
      const managers = Array.from(new Set(orders.map(item => item.manager).filter(Boolean)))
      result.push({
        id: managerField.id,
        title: managerField.title,
        options: managers.map(mgr => ({ value: mgr!, label: mgr! }))
      })
    }
    
    return result
  }, [orders])

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
  const handleRefresh = async () => {
    await refresh()
  }

  // 내보내기 핸들러
  const handleExport = () => {
    setShowExportDialog(true)
  }

  // 로딩 상태
  if (loading && orders.length === 0) {
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
          <OrderDataTableToolbar
            table={table}
            onRefresh={enableSearch ? handleRefresh : undefined}
            onExport={enableExport ? handleExport : undefined}
            searchPlaceholder="주문 검색..."
            filterableColumns={enableFilters ? filterableColumns.filter(col => col.options.length > 0) : []}
            dateRange={dateRange}
            onDateRangeChange={enableDateFilter ? setDateRange : undefined}
            showDateFilter={enableDateFilter}
            dateFilterPlaceholder="날짜 범위 선택"
            isLoading={loading || isSearching}
            globalFilter={globalFilter}
            onGlobalFilterChange={enableSearch ? setGlobalFilter : () => {}}
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
}

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