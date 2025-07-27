// Order 테이블 컬럼 정의

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

import { Order } from "@/types/models"
import { DataTableColumnHeader } from "../data-table-column-header"
import {
  NumberCell,
  CurrencyCell,
  DateStringCell,
  StatusBadge,
  TextCell,
} from "../cells"

// Order 테이블 컬럼 정의
export const orderColumns: ColumnDef<Order>[] = [
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
    accessorKey: "col0",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <NumberCell 
        value={row.getValue("col0")} 
        className="text-center font-medium"
      />
    ),
    enableSorting: true,
    size: 70,
  },

  // 날짜 (년월일 합쳐서 표시)
  {
    id: "orderDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="날짜" />
    ),
    cell: ({ row }) => {
      const year = row.original.year;
      const month = row.original.month;
      const day = row.original.day;
      
      if (!year || !month || !day) {
        return <span className="text-muted-foreground">-</span>;
      }
      
      // 년월일을 합쳐서 날짜 형식으로 표시
      const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      return (
        <TextCell 
          value={dateString} 
          className="font-mono text-sm"
        />
      );
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(`${rowA.original.year}-${rowA.original.month}-${rowA.original.day}`);
      const dateB = new Date(`${rowB.original.year}-${rowB.original.month}-${rowB.original.day}`);
      return dateA.getTime() - dateB.getTime();
    },
    size: 120,
  },

  // 분류
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="분류" />
    ),
    cell: ({ row }) => (
      <TextCell 
        value={row.getValue("category")} 
        maxLength={15}
        showTooltip
      />
    ),
    enableSorting: true,
    size: 100,
  },

  // 발주번호
  {
    accessorKey: "finalorderNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="발주번호" />
    ),
    cell: ({ row }) => (
      <TextCell 
        value={row.getValue("finalorderNumber")} 
        className="font-medium"
        maxLength={20}
        showTooltip
      />
    ),
    enableSorting: true,
    size: 120,
  },

  // 열1
  {
    accessorKey: "orderNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="열1" />
    ),
    cell: ({ row }) => (
      <TextCell 
        value={row.getValue("orderNumber")} 
        className="font-medium"
        maxLength={20}
        showTooltip
      />
    ),
    enableSorting: true,
    size: 120,
  },

  // 코드
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="코드" />
    ),
    cell: ({ row }) => (
      <TextCell 
        value={row.getValue("code")} 
        className="font-mono text-sm"
        maxLength={15}
        showTooltip
      />
    ),
    enableSorting: true,
    size: 100,
  },

  // 발주처
  {
    accessorKey: "customer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="발주처" />
    ),
    cell: ({ row }) => (
      <TextCell 
        value={row.getValue("customer")} 
        maxLength={20}
        showTooltip
      />
    ),
    enableSorting: true,
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
    enableSorting: true,
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
    enableSorting: true,
    size: 150,
  },

  // 발주수량
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="발주수량" className="text-right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <NumberCell 
          value={row.getValue("quantity")} 
          format="integer"
        />
      </div>
    ),
    enableSorting: true,
    size: 100,
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
        maxLength={30}
        showTooltip
      />
    ),
    enableSorting: true,
    size: 200,
  },

  // 진행상태
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="진행상태" />
    ),
    cell: ({ row }) => (
      <StatusBadge status={row.getValue("status")} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: true,
    size: 120,
  },

  // 출하일
  {
    accessorKey: "shippingDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="출하일" />
    ),
    cell: ({ row }) => (
      <DateStringCell dateString={row.getValue("shippingDate")} />
    ),
    enableSorting: true,
    size: 120,
  },

  // 담당
  {
    accessorKey: "manager",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="담당" />
    ),
    cell: ({ row }) => (
      <TextCell 
        value={row.getValue("manager")} 
        maxLength={10}
        showTooltip
      />
    ),
    enableSorting: true,
    size: 100,
  },

  // 단가
  {
    accessorKey: "unitPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="단가" className="text-right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <CurrencyCell amount={row.getValue("unitPrice")} />
      </div>
    ),
    enableSorting: true,
    size: 120,
  },

  // 발주금액
  {
    accessorKey: "orderAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="발주금액" className="text-right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <CurrencyCell amount={row.getValue("orderAmount")} />
      </div>
    ),
    enableSorting: true,
    size: 140,
  },


  // 액션 버튼
  {
    id: "actions",
    header: "액션",
    cell: ({ row }) => {
      const order = row.original

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
              onClick={() => navigator.clipboard.writeText(order.col0.toString())}
            >
              ID 복사
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>보기</DropdownMenuItem>
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
export const orderSearchableFields = [
  'finalorderNumber',
  'customer', 
  'productName', 
  'partName', 
  'code'
] as const

// 필터 가능한 필드들
export const orderFilterableFields = [
  {
    id: 'status',
    title: '진행상태',
    options: [
      { value: '대기', label: '대기' },
      { value: '진행중', label: '진행중' },
      { value: '완료', label: '완료' },
      { value: '보류', label: '보류' },
      { value: '취소', label: '취소' },
    ]
  },
  {
    id: 'category',
    title: '분류',
    options: [] // 실제 데이터에서 동적으로 생성
  },
  {
    id: 'manager',
    title: '담당자',
    options: [] // 실제 데이터에서 동적으로 생성
  }
] as const