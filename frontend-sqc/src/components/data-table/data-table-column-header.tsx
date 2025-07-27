import { useSearchParams } from "react-router-dom"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from "@radix-ui/react-icons"
import { type Column } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [searchParams] = useSearchParams()

  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>
  }

  const [columnName, sortOrder] = searchParams.get("sort")?.split(".") ?? []
  const isSorted = columnName === column.id

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={
              sortOrder === "desc" && isSorted
                ? "내림차순으로 정렬됨. 클릭하여 오름차순으로 정렬."
                : sortOrder === "asc" && isSorted
                  ? "오름차순으로 정렬됨. 클릭하여 내림차순으로 정렬."
                  : "정렬되지 않음. 클릭하여 오름차순으로 정렬."
            }
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getCanSort() && sortOrder === "desc" && isSorted ? (
              <ArrowDownIcon className="ml-2 size-4" aria-hidden="true" />
            ) : sortOrder === "asc" && isSorted ? (
              <ArrowUpIcon className="ml-2 size-4" aria-hidden="true" />
            ) : (
              <CaretSortIcon className="ml-2 size-4" aria-hidden="true" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="dark:bg-background/95 dark:backdrop-blur-md dark:supports-[backdrop-filter]:bg-background/40"
        >
          {column.getCanSort() && (
            <>
              <DropdownMenuItem
                aria-label="오름차순 정렬"
                onClick={() => column.toggleSorting(false)}
              >
                <ArrowUpIcon
                  className="mr-2 size-3.5 text-muted-foreground/70"
                  aria-hidden="true"
                />
                오름차순
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="내림차순 정렬"
                onClick={() => column.toggleSorting(true)}
              >
                <ArrowDownIcon
                  className="mr-2 size-3.5 text-muted-foreground/70"
                  aria-hidden="true"
                />
                내림차순
              </DropdownMenuItem>
            </>
          )}
          {column.getCanSort() && column.getCanHide() && (
            <DropdownMenuSeparator />
          )}
          {column.getCanHide() && (
            <DropdownMenuItem
              aria-label="열 숨기기"
              onClick={() => column.toggleVisibility(false)}
            >
              <EyeNoneIcon
                className="mr-2 size-3.5 text-muted-foreground/70"
                aria-hidden="true"
              />
              숨기기
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}