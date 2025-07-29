import { Cross2Icon, MagnifyingGlassIcon, DownloadIcon, ReloadIcon, UploadIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"
import { DateRange } from "react-day-picker"
import { useState, useEffect, useCallback, memo, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import type { Option } from "@/types/data-table"
import { DataTableColumnsVisibility } from "./data-table-columns-visibility"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { DateRangePicker } from "@/components/date-range-picker"
import { cn } from "@/lib/utils"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onRefresh?: () => void
  onExport?: () => void
  onUpload?: () => void
  searchPlaceholder?: string
  filterableColumns?: Array<{
    id: string
    title: string
    options: Option[]
  }>
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange | undefined) => void
  showDateFilter?: boolean
  dateFilterPlaceholder?: string
  isLoading?: boolean
  isSearching?: boolean // 검색 중 상태 추가
  isUploading?: boolean
  uploadProgress?: number
  columnLabels?: Record<string, string>
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
}

export const DataTableToolbar = memo(<TData>({
  table,
  onRefresh,
  onExport,
  onUpload,
  searchPlaceholder = "검색...",
  filterableColumns = [],
  dateRange,
  onDateRangeChange,
  showDateFilter = false,
  dateFilterPlaceholder = "날짜 범위 선택",
  isLoading = false,
  isSearching: externalIsSearching = false, // 외부에서 전달받은 검색 상태
  isUploading = false,
  uploadProgress = 0,
  globalFilter = "",
  onGlobalFilterChange,
  columnLabels = {},
}: DataTableToolbarProps<TData>) => {
  // 로컬 검색 상태 - 포커스 해제 방지
  const [localSearchValue, setLocalSearchValue] = useState(globalFilter)
  
  // 입력 필드 참조 - 포커스 관리용
  const inputRef = useRef<HTMLInputElement>(null)
  
  // 검색 중인지 확인 (외부 상태 우선, 없으면 로컬 상태 사용)
  const isSearching = externalIsSearching || (localSearchValue !== globalFilter && localSearchValue.length > 0)
  
  // globalFilter가 외부에서 변경될 때 로컬 상태 동기화
  useEffect(() => {
    setLocalSearchValue(globalFilter)
  }, [globalFilter])
  
  // 디바운스된 검색어 업데이트 (300ms로 통일)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchValue !== globalFilter) {
        onGlobalFilterChange?.(localSearchValue)
      }
    }, 300) // 300ms 디바운스로 통일
    
    return () => clearTimeout(timer)
  }, [localSearchValue, globalFilter, onGlobalFilterChange])

  // 메모이제이션된 핸들러 함수들
  const handleResetFilters = useCallback(() => {
    table.resetColumnFilters()
    onDateRangeChange?.(undefined)
    setLocalSearchValue("") // 로컬 상태도 초기화
    onGlobalFilterChange?.("")
    // 포커스 유지
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [table, onDateRangeChange, onGlobalFilterChange])

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setLocalSearchValue(newValue)
  }, [])

  const isFiltered = table.getState().columnFilters.length > 0 || !!globalFilter

  return (
    <div className="flex flex-col gap-4 p-4 bg-card border border-border rounded-lg shadow-sm">
      {/* 상단 영역: 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          {/* 검색 입력 */}
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {/* 검색 중 로딩 인디케이터 */}
            {isSearching && (
              <ReloadIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary animate-spin" />
            )}
            <Input
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={localSearchValue}
              onChange={handleSearchChange}
              className={cn(
                "h-9 pl-9 bg-background border-border",
                isSearching ? "pr-9" : "pr-4", // 검색 중일 때 오른쪽 패딩 조정
                "focus:ring-2 focus:ring-ring focus:border-transparent",
                "transition-all duration-200",
                isSearching && "border-primary/50" // 검색 중일 때 테두리 색상 변경
              )}
              // disabled 제거 - 검색 필드는 항상 활성화 상태 유지
            />
          </div>
          
          {/* 날짜 범위 필터 */}
          {showDateFilter && onDateRangeChange && (
            <div className="flex-shrink-0">
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={onDateRangeChange}
                placeholder={dateFilterPlaceholder}
                triggerSize="sm"
                triggerClassName={cn(
                  "h-9 w-[220px] bg-background border-border",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-colors duration-200"
                )}
              />
            </div>
          )}
        </div>
        
        {/* 우측 액션 버튼들 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* 업로드 프로그레스바 - 업로드 중일 때만 표시 */}
          {isUploading && (
            <div className="flex items-center gap-3 mr-4">
              <div className="w-24">
                <Progress value={uploadProgress} className="h-2" />
              </div>
              <span className="text-sm font-medium text-primary">{uploadProgress}%</span>
            </div>
          )}
          
          {/* 엑셀 업로드 버튼 */}
          {onUpload && (
            <Button
              variant="default"
              size="sm"
              onClick={onUpload}
              className={cn(
                "h-9 px-3 bg-primary text-primary-foreground",
                "hover:bg-primary/90",
                "transition-all duration-200",
                (isLoading || isUploading) && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading || isUploading}
            >
              {isUploading ? (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UploadIcon className="mr-2 h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isUploading ? "업로드중" : "엑셀 업로드"}
              </span>
            </Button>
          )}
          
          {/* 내보내기 버튼 */}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className={cn(
                "h-9 px-3 bg-background border-border",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-all duration-200",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading}
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">내보내기</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* 하단 영역: 필터 및 초기화 */}
      {(filterableColumns.length > 0 || isFiltered || onRefresh) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
          {/* 좌측: 패싯 필터들과 초기화 버튼 */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 패싯 필터들 */}
            {filterableColumns.map((column) => {
              const tableColumn = table.getColumn(column.id)
              if (!tableColumn) return null
              
              return (
                <DataTableFacetedFilter
                  key={column.id}
                  column={tableColumn}
                  title={column.title}
                  options={column.options}
                  selectedOption={{
                    id: column.id,
                    label: column.title,
                    value: column.id as keyof TData,
                    options: column.options,
                    filterValues: (tableColumn.getFilterValue() as string[]) ?? [],
                  }}
                  setSelectedOptions={(updater) => {
                    if (typeof updater === 'function') {
                      const currentOptions = [{
                        id: column.id,
                        label: column.title,
                        value: column.id as keyof TData,
                        options: column.options,
                        filterValues: (tableColumn.getFilterValue() as string[]) ?? [],
                      }]
                      const newOptions = updater(currentOptions)
                      const newOption = newOptions.find(opt => opt.id === column.id)
                      if (newOption && newOption.filterValues) {
                        tableColumn.setFilterValue(newOption.filterValues.length > 0 ? newOption.filterValues : undefined)
                      }
                    }
                  }}
                />
              )
            })}
            
            {/* 필터 초기화 버튼 */}
            {isFiltered && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                className={cn(
                  "h-8 px-2 text-sm",
                  "hover:bg-destructive/10 hover:text-destructive",
                  "transition-colors duration-200",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                disabled={isLoading}
              >
                초기화
                <Cross2Icon className="ml-2 h-3 w-3" />
              </Button>
            )}
          </div>

          {/* 우측: 새로고침 및 컬럼 표시 버튼 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* 새로고침 버튼 */}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className={cn(
                  "h-8 px-3 bg-background border-border",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-all duration-200",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ReloadIcon className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <ReloadIcon className="mr-2 h-3 w-3" />
                )}
                <span className="hidden sm:inline">새로고침</span>
              </Button>
            )}
            
            {/* 컬럼 표시 버튼 */}
            <DataTableColumnsVisibility columnLabels={columnLabels} />
          </div>
        </div>
      )}
    </div>
  )
}) as <TData>(props: DataTableToolbarProps<TData>) => React.ReactElement