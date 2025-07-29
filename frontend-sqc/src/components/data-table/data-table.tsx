import * as React from "react"
import { flexRender, type Table as TanstackTable } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"

interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type TanstackTable<TData>
   */
  table: TanstackTable<TData>

  /**
   * The floating bar to render at the bottom of the table on row selection.
   * @default null
   * @type React.ReactNode | null
   * @example floatingBar={<TasksTableFloatingBar />}
   */
  floatingBar?: React.ReactNode | null
}

export function DataTable<TData>({
  table,
  floatingBar = null,
  children,
  className,
  ...props
}: DataTableProps<TData>) {
  return (
    <div
      className={cn("data-table-container", className)}
      {...props}
    >
      {children}
      
      {/* 테이블 컨테이너 - 반응형 및 테마 지원 */}
      <div className="data-table-wrapper">
        {/* 테이블 스크롤 컨테이너 */}
        <div className="data-table-scroll overflow-x-auto">
          <Table className="relative min-w-[800px]">
            {/* 테이블 헤더 - 고정 및 스타일링 개선 */}
            <TableHeader className="bg-muted/50 backdrop-blur-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow 
                  key={headerGroup.id}
                  className="border-b border-border hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead 
                        key={header.id}
                        className={cn(
                          "h-12 px-4 text-center align-middle font-medium text-muted-foreground",
                          "bg-muted/30 first:rounded-tl-lg last:rounded-tr-lg",
                          "border-r border-border/50 last:border-r-0",
                          "transition-colors duration-200"
                        )}
                        style={{
                          width: header.getSize(),
                          minWidth: header.getSize(),
                          maxWidth: header.getSize(),
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            
            {/* 테이블 바디 - 호버 효과 및 선택 상태 개선 */}
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "data-table-row group",
                      // 줄무늬 효과 (선택적)
                      index % 2 === 0 ? "bg-background" : "bg-muted/60"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id}
                        className="data-table-cell text-center"
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize(),
                          maxWidth: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="data-table-cell-empty h-32 text-center bg-muted/10 border-none"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-lg font-medium">데이터가 없습니다</div>
                      <div className="text-sm">검색 조건을 변경하거나 필터를 초기화해보세요</div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* 테이블 하단 그라데이션 효과 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      
      {/* 하단 컨트롤 영역 */}
      <div className="flex flex-col gap-3">
        <DataTablePagination />
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="relative">
            {floatingBar}
          </div>
        )}
      </div>
    </div>
  )
}