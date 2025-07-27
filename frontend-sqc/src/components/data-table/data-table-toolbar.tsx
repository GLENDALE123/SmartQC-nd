import { Cross2Icon, MagnifyingGlassIcon, DownloadIcon, ReloadIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Option } from "@/types/data-table"
import { DataTableColumnsVisibility } from "./data-table-columns-visibility"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { DateRangePicker } from "@/components/date-range-picker"
import { cn } from "@/lib/utils"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onRefresh?: () => void
  onExport?: () => void
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
  columnLabels?: Record<string, string>
}

export function DataTableToolbar<TData>({
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
  columnLabels = {},
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || dateRange?.from || dateRange?.to

  const handleResetFilters = () => {
    table.resetColumnFilters()
    onDateRangeChange?.(undefined)
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-card border border-border rounded-lg shadow-sm">
      {/* 상단 영역: 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          {/* 검색 입력 */}
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn("search")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("search")?.setFilterValue(event.target.value)
              }
              className={cn(
                "h-9 pl-9 pr-4 bg-background border-border",
                "focus:ring-2 focus:ring-ring focus:border-transparent",
                "transition-all duration-200",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading}
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
          {/* 새로고침 버튼 */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className={cn(
                "h-9 px-3 bg-background border-border",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-all duration-200",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ReloadIcon className="mr-2 h-4 w-4" />
              )}
              <span className="hidden sm:inline">새로고침</span>
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
          
          {/* 열 가시성 토글 */}
          <DataTableColumnsVisibility columnLabels={columnLabels} />
        </div>
      </div>
      
      {/* 하단 영역: 필터 및 초기화 */}
      {(filterableColumns.length > 0 || isFiltered) && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
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
      )}
    </div>
  )
}