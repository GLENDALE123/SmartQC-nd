import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import type { DataTableFilterField } from "@/types/data-table"
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import { useDebounce } from "@/hooks/use-debounce"

interface UseDataTableProps<TData, TValue> {
  /**
   * The data for the table.
   * @default []
   * @type TData[]
   */
  data: TData[]

  /**
   * The columns of the table.
   * @default []
   * @type ColumnDef<TData, TValue>[]
   */
  columns: ColumnDef<TData, TValue>[]

  /**
   * The number of pages in the table.
   * @type number
   */
  pageCount: number

  /**
   * The default number of rows per page.
   * @default 10
   * @type number | undefined
   * @example 20
   */
  defaultPerPage?: number

  /**
   * The default sort order.
   * @default undefined
   * @type `${Extract<keyof TData, string | number>}.${"asc" | "desc"}` | undefined
   * @example "createdAt.desc"
   */
  defaultSort?: `${Extract<keyof TData, string | number>}.${"asc" | "desc"}`

  /**
   * Defines filter fields for the table. Supports both dynamic faceted filters and search filters.
   * - Faceted filters are rendered when `options` are provided for a filter field.
   * - Otherwise, search filters are rendered.
   *
   * The indie filter field `value` represents the corresponding column name in the database table.
   * @default []
   * @type { label: string, value: keyof TData, placeholder?: string, options?: { label: string, value: string, icon?: React.ComponentType<{ className?: string }> }[] }[]
   * @example
   * ```ts
   * // Render a search filter
   * const filterFields = [
   *   { label: "Title", value: "title", placeholder: "Search titles" }
   * ];
   * // Render a faceted filter
   * const filterFields = [
   *   {
   *     label: "Status",
   *     value: "status",
   *     options: [
   *       { label: "Todo", value: "todo" },
   *       { label: "In Progress", value: "in-progress" },
   *       { label: "Done", value: "done" },
   *       { label: "Canceled", value: "canceled" }
   *     ]
   *   }
   * ];
   * ```
   */
  filterFields?: DataTableFilterField<TData>[]
}

function createQueryString(
  params: Record<string, string | number | null>,
  searchParams: URLSearchParams
): string {
  const newSearchParams = new URLSearchParams(searchParams)
  
  for (const [key, value] of Object.entries(params)) {
    if (value === null) {
      newSearchParams.delete(key)
    } else {
      newSearchParams.set(key, String(value))
    }
  }
  
  return newSearchParams.toString()
}

export function useDataTable<TData, TValue>({
  data,
  columns,
  pageCount,
  defaultPerPage = 10,
  defaultSort,
  filterFields = [],
}: UseDataTableProps<TData, TValue>) {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  // Search params
  const page = Number(searchParams.get("page")) || 1
  const perPage = Number(searchParams.get("per_page")) || defaultPerPage
  const sort = searchParams.get("sort") || defaultSort
  const [column, order] = sort?.split(".") ?? []

  // Memoize computation of searchableColumns and filterableColumns
  const { searchableColumns, filterableColumns } = React.useMemo(() => {
    return {
      searchableColumns: filterFields.filter((field) => !field.options),
      filterableColumns: filterFields.filter((field) => field.options),
    }
  }, [filterFields])

  // Initial column filters
  const initialColumnFilters: ColumnFiltersState = React.useMemo(() => {
    return Array.from(searchParams.entries()).reduce<ColumnFiltersState>(
      (filters, [key, value]) => {
        const filterableColumn = filterableColumns.find(
          (column) => column.value === key
        )
        const searchableColumn = searchableColumns.find(
          (column) => column.value === key
        )

        if (filterableColumn) {
          filters.push({
            id: key,
            value: value.split("."),
          })
        } else if (searchableColumn) {
          filters.push({
            id: key,
            value: [value],
          })
        }

        return filters
      },
      []
    )
  }, [filterableColumns, searchableColumns, searchParams])

  // Table states
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(initialColumnFilters)

  // Handle server-side pagination
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: page - 1,
      pageSize: perPage,
    })

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  React.useEffect(() => {
    const newParams = createQueryString(
      {
        page: pageIndex + 1,
        per_page: pageSize,
      },
      searchParams
    )
    navigate(`${location.pathname}?${newParams}`, { replace: true })
  }, [pageIndex, pageSize])

  // Handle server-side sorting
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: column ?? "",
      desc: order === "desc",
    },
  ])

  React.useEffect(() => {
    const newParams = createQueryString(
      {
        page,
        sort: sorting[0]?.id
          ? `${sorting[0]?.id}.${sorting[0]?.desc ? "desc" : "asc"}`
          : null,
      },
      searchParams
    )
    navigate(`${location.pathname}?${newParams}`, { replace: true })
  }, [sorting])

  // Handle server-side filtering
  const debouncedSearchableColumnFilters = JSON.parse(
    useDebounce(
      JSON.stringify(
        columnFilters.filter((filter) => {
          return searchableColumns.find((column) => column.value === filter.id)
        })
      ),
      300
    )
  ) as ColumnFiltersState

  const filterableColumnFilters = columnFilters.filter((filter) => {
    return filterableColumns.find((column) => column.value === filter.id)
  })

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // Prevent resetting the page on initial render
    if (!mounted) {
      setMounted(true)
      return
    }

    // Initialize new params
    const newParamsObject: Record<string, string | number | null> = {
      page: 1,
    }

    // Handle debounced searchable column filters
    for (const column of debouncedSearchableColumnFilters) {
      if (typeof column.value === "string") {
        Object.assign(newParamsObject, {
          [column.id]: column.value,
        })
      }
    }

    // Handle filterable column filters
    for (const column of filterableColumnFilters) {
      if (typeof column.value === "object" && Array.isArray(column.value)) {
        Object.assign(newParamsObject, { [column.id]: column.value.join(".") })
      }
    }

    // Remove deleted values
    for (const key of searchParams.keys()) {
      if (
        (searchableColumns.find((column) => column.value === key) &&
          !debouncedSearchableColumnFilters.find(
            (column) => column.id === key
          )) ||
        (filterableColumns.find((column) => column.value === key) &&
          !filterableColumnFilters.find((column) => column.id === key))
      ) {
        Object.assign(newParamsObject, { [key]: null })
      }
    }

    // After cumulating all the changes, push new params
    const newParams = createQueryString(newParamsObject, searchParams)
    navigate(`${location.pathname}?${newParams}`, { replace: true })

    table.setPageIndex(0)

  }, [
    JSON.stringify(debouncedSearchableColumnFilters),
    JSON.stringify(filterableColumnFilters),
  ])

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    enableColumnResizing: true, // 컬럼 리사이징 활성화
    columnResizeMode: 'onChange', // 실시간 리사이징
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true, // 서버 사이드 정렬 활성화
    manualFiltering: true,
  })

  return { table }
}