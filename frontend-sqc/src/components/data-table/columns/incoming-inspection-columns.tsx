// IncomingInspection 테이블 컬럼 정의

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

import { IncomingInspection, InspectionDraftStatus } from "@/types/models"
import { DataTableColumnHeader } from "../data-table-column-header"
import {
  NumberCell,
  DateCell,
  StatusBadge,
  ArrayCell,
  TextCell,
} from "../cells"

// 검사 상태 배지 컴포넌트
function InspectionStatusBadge({ status }: { status: InspectionDraftStatus }) {
  const getStatusLabel = (status: InspectionDraftStatus) => {
    switch (status) {
      case InspectionDraftStatus.DRAFT:
        return '임시저장'
      case InspectionDraftStatus.COMPLETED:
        return '완료'
      default:
        return status
    }
  }

  const getStatusVariant = (status: InspectionDraftStatus) => {
    switch (status) {
      case InspectionDraftStatus.COMPLETED:
        return 'default' as const
      case InspectionDraftStatus.DRAFT:
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  return (
    <StatusBadge 
      status={getStatusLabel(status)} 
      variant={getStatusVariant(status)}
    />
  )
}

// IncomingInspection 테이블 컬럼 정의
export const incomingInspectionColumns: ColumnDef<IncomingInspection>[] = [
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

  // 발주번호 (배열)
  {
    accessorKey: "orderNumbers",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="발주번호" />
    ),
    cell: ({ row }) => (
      <ArrayCell 
        values={row.getValue("orderNumbers")} 
        maxDisplay={2}
      />
    ),
    enableSorting: false,
    size: 150,
  },

  // 발주처
  {
    accessorKey: "client",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="발주처" />
    ),
    cell: ({ row }) => (
      <TextCell 
        value={row.getValue("client")} 
        maxLength={20}
        showTooltip
      />
    ),
    size: 150,
  },

  // 제품명
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="제품명" />
    ),
    cell: ({ row }) => (
      <TextCell 
        value={row.getValue("productName")} 
        maxLength={25}
        showTooltip
      />
    ),
    size: 200,
  },

  // 부속명
  {
    accessorKey: "partName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="부속명" />
    ),
    cell: ({ row }) => (
      <TextCell 
        value={row.getValue("partName")} 
        maxLength={20}
        showTooltip
      />
    ),
    size: 150,
  },

  // 검사일
  {
    accessorKey: "inspectionDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="검사일" />
    ),
    cell: ({ row }) => (
      <DateCell 
        date={row.getValue("inspectionDate")} 
        showTime={false}
      />
    ),
    size: 120,
  },

  // 총 수량
  {
    accessorKey: "totalQty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="총 수량" className="text-right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <NumberCell 
          value={row.getValue("totalQty")} 
          format="integer"
        />
      </div>
    ),
    size: 100,
  },

  // 불량 수량
  {
    accessorKey: "defectQty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="불량 수량" className="text-right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <NumberCell 
          value={row.getValue("defectQty")} 
          format="integer"
        />
      </div>
    ),
    size: 100,
  },

  // 상태
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="상태" />
    ),
    cell: ({ row }) => (
      <InspectionStatusBadge status={row.getValue("status")} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 100,
  },

  // 담당자
  {
    accessorKey: "manager",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="담당자" />
    ),
    cell: ({ row }) => (
      <TextCell 
        value={row.getValue("manager")} 
        maxLength={10}
        showTooltip
      />
    ),
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
      const inspection = row.original

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
              onClick={() => navigator.clipboard.writeText(inspection.id.toString())}
            >
              ID 복사
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>보기</DropdownMenuItem>
            <DropdownMenuItem>편집</DropdownMenuItem>
            {inspection.status === InspectionDraftStatus.DRAFT && (
              <DropdownMenuItem>완료 처리</DropdownMenuItem>
            )}
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
export const incomingInspectionSearchableFields = [
  'client',
  'productName', 
  'partName', 
  'manager'
] as const

// 필터 가능한 필드들
export const incomingInspectionFilterableFields = [
  {
    id: 'status',
    title: '상태',
    options: [
      { value: 'draft', label: '임시저장' },
      { value: 'completed', label: '완료' },
    ]
  }
] as const