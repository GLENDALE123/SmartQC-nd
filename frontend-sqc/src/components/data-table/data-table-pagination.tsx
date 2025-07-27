import { useSearchParams, useNavigate, useLocation } from "react-router-dom"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { useTableInstanceContext } from "./table-instance-provider"

interface DataTablePaginationProps {
  pageSizeOptions?: number[]
}

export function DataTablePagination({
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTablePaginationProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const { tableInstance: table } = useTableInstanceContext()

  const perPage = searchParams.get("per_page") ?? 10

  // URL 파라미터 업데이트 함수
  const updateSearchParams = (updates: Record<string, string | number | null>) => {
    const newSearchParams = new URLSearchParams(searchParams)
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, String(value))
      }
    })
    
    navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true })
  }

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length
  const totalRowsCount = table.getFilteredRowModel().rows.length
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()

  return (
    <div className="flex w-full flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      {/* 선택된 행 정보 */}
      <div className="flex flex-1 items-center justify-center sm:justify-start">
        <div className="text-sm text-muted-foreground">
          {selectedRowsCount > 0 ? (
            <span className="font-medium text-foreground">
              {selectedRowsCount.toLocaleString()}개 선택됨
            </span>
          ) : (
            <span>
              총 {totalRowsCount.toLocaleString()}개 항목
            </span>
          )}
        </div>
      </div>
      
      {/* 페이지네이션 컨트롤 */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        {/* 페이지 크기 선택 */}
        <div className="flex items-center space-x-2">
          <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
            페이지당 행 수
          </p>
          <Select
            value={`${perPage}`}
            onValueChange={(value) => {
              // URL 파라미터 업데이트 (페이지를 1로 리셋하고 페이지 크기 변경)
              updateSearchParams({
                page: 1,
                per_page: Number(value)
              })
            }}
          >
            <SelectTrigger className={cn(
              "h-8 w-[70px] bg-background border-border",
              "hover:bg-accent hover:text-accent-foreground",
              "transition-colors duration-200"
            )}>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent
              side="top"
              className={cn(
                "bg-popover/95 backdrop-blur-md border-border",
                "supports-[backdrop-filter]:bg-popover/80"
              )}
            >
              {pageSizeOptions.map((pageSize) => (
                <SelectItem 
                  key={pageSize} 
                  value={`${pageSize}`}
                  className="hover:bg-accent hover:text-accent-foreground"
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* 페이지 정보 */}
        <div className="flex items-center justify-center">
          <div className="text-sm font-medium text-muted-foreground">
            <span className="text-foreground">{currentPage}</span> / {totalPages} 페이지
          </div>
        </div>
        
        {/* 페이지 네비게이션 버튼 */}
        <div className="flex items-center space-x-1">
          <Button
            aria-label="첫 페이지로 이동"
            variant="outline"
            size="icon"
            className={cn(
              "hidden h-8 w-8 lg:flex",
              "bg-background border-border",
              "hover:bg-accent hover:text-accent-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
            onClick={() => updateSearchParams({ page: 1 })}
            disabled={!table.getCanPreviousPage()}
          >
            <DoubleArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          
          <Button
            aria-label="이전 페이지로 이동"
            variant="outline"
            size="icon"
            className={cn(
              "h-8 w-8",
              "bg-background border-border",
              "hover:bg-accent hover:text-accent-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
            onClick={() => updateSearchParams({ page: currentPage - 1 })}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          
          <Button
            aria-label="다음 페이지로 이동"
            variant="outline"
            size="icon"
            className={cn(
              "h-8 w-8",
              "bg-background border-border",
              "hover:bg-accent hover:text-accent-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
            onClick={() => updateSearchParams({ page: currentPage + 1 })}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          
          <Button
            aria-label="마지막 페이지로 이동"
            variant="outline"
            size="icon"
            className={cn(
              "hidden h-8 w-8 lg:flex",
              "bg-background border-border",
              "hover:bg-accent hover:text-accent-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
            onClick={() => updateSearchParams({ page: totalPages })}
            disabled={!table.getCanNextPage()}
          >
            <DoubleArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  )
}