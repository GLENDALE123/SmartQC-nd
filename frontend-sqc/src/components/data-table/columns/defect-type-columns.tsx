// DefectType 테이블 컬럼 정의

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DefectType } from "@/types/models"
import { DataTableColumnHeader } from "../data-table-column-header"
import {
  NumberCell,
  DateCell,
  ColorCell,
  TextCell,
} from "../cells"

// DefectType 테이블 컬럼 정의
export const defectTypeColumns: ColumnDef<DefectType>[] = [
  // 선택 체크박스 열
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="모든 행 선택"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="행 선택"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },

  // ID
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <NumberCell 
        value={row.getValue("id")} 
        className="text-center font-medium"
      />
    ),
    size: 80,
  },

  // 이름
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="이름" />
    ),
    cell: ({ row }) => (
      <TextCell 
        value={row.getValue("name")} 
        className="font-medium"
        maxLength={20}
        showTooltip
      />
    ),
    size: 150,
  },

  // 설명
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="설명" />
    ),
    cell: ({ row }) => (
      <TextCell 
        value={row.getValue("description")} 
        maxLength={50}
        showTooltip
      />
    ),
    size: 300,
  },

  // 색상
  {
    accessorKey: "color",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="색상" />
    ),
    cell: ({ row }) => (
      <ColorCell color={row.getValue("color")} />
    ),
    enableSorting: false,
    size: 100,
  },

  // 생성일
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="생성일" />
    ),
    cell: ({ row }) => (
      <DateCell 
        date={row.getValue("createdAt")} 
        showTime
      />
    ),
    size: 160,
  },

  // 액션 버튼
  {
    id: "actions",
    header: "액션",
    cell: ({ row }) => {
      const defectType = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>액션</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(defectType.id.toString())}
            >
              ID 복사
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>편집</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
]

// 검색 가능한 필드들
export const defectTypeSearchableFields = [
  'name',
  'description'
] as const

// 필터 가능한 필드들 (DefectType은 필터가 거의 없음)
export const defectTypeFilterableFields = [] as const