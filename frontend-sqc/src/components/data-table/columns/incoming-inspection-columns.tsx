// IncomingInspection 테이블 컬럼 정의

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "../data-table-column-header"
import { DataTableRowActions } from "../data-table-row-actions"
import { StatusBadge } from "../cells/status-badge"
import { NumberCell, TextCell, DateCell, ArrayCell } from "../cells"
import { InspectionDraftStatus } from "@/types/inspection"

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
        className="max-w-[200px] truncate"
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
        className="max-w-[200px] truncate"
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
        className="max-w-[200px] truncate"
      />
    ),
    size: 200,
  },

  // 사양
  {
    accessorKey: "specification",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="사양" />
    ),
    cell: ({ row }) => (
      <TextCell 
        value={row.getValue("specification")} 
        className="max-w-[200px] truncate"
      />
    ),
    size: 200,
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
        className="max-w-[150px] truncate"
      />
    ),
    size: 120,
  },

  // 검사일
  {
    accessorKey: "inspectionDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="검사일" />
    ),
    cell: ({ row }) => (
      <DateCell 
        value={row.getValue("inspectionDate")} 
        format="yyyy-MM-dd"
      />
    ),
    size: 120,
  },

  // 총 수량
  {
    accessorKey: "totalQty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="총 수량" />
    ),
    cell: ({ row }) => (
      <NumberCell 
        value={row.getValue("totalQty")} 
        className="text-center"
      />
    ),
    size: 100,
  },

  // 불량 수량
  {
    accessorKey: "defectQty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="불량 수량" />
    ),
    cell: ({ row }) => (
      <NumberCell 
        value={row.getValue("defectQty")} 
        className="text-center"
      />
    ),
    size: 100,
  },

  // 상태
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="상태" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as InspectionDraftStatus
      return (
        <StatusBadge 
          status={status === InspectionDraftStatus.DRAFT ? '임시저장' : '완료'} 
          variant={status === InspectionDraftStatus.COMPLETED ? 'default' : 'secondary'}
        />
      )
    },
    size: 100,
  },

  // 비고
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="비고" />
    ),
    cell: ({ row }) => (
      <TextCell 
        value={row.getValue("notes")} 
        className="max-w-[200px] truncate"
      />
    ),
    size: 200,
  },

  // 생성일
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="생성일" />
    ),
    cell: ({ row }) => (
      <DateCell 
        value={row.getValue("createdAt")} 
        format="yyyy-MM-dd HH:mm"
      />
    ),
    size: 150,
  },

  // 수정일
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="수정일" />
    ),
    cell: ({ row }) => (
      <DateCell 
        value={row.getValue("updatedAt")} 
        format="yyyy-MM-dd HH:mm"
      />
    ),
    size: 150,
  },

  // 액션
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
    size: 80,
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