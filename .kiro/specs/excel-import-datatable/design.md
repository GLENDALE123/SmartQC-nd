# Design Document

## Overview

엑셀 가져오기 페이지에 order 테이블 데이터를 표시하는 고급 DataTable 컴포넌트를 구현합니다. 이 컴포넌트는 shadcn-ui와 TanStack Table을 기반으로 하며, 검색, 필터링, 정렬, 페이지네이션, 열 가시성 토글, 데이터 내보내기 등의 기능을 제공합니다.

## Architecture

### Component Structure
```
ExcelImportPage
├── ExcelImportComponent (기존)
└── MultiTableDataView (새로 추가)
    ├── TableSelector (왼쪽 사이드바)
    │   ├── TableDropdown ("All tables" 드롭다운)
    │   ├── ViewList (Order, User, DefectType 등)
    │   └── AddViewButton
    └── DataTableContainer
        ├── DataTableToolbar
        │   ├── SearchInput
        │   ├── ColumnFilters
        │   ├── DateRangePicker
        │   ├── ViewOptions
        │   └── ExportButton
        ├── DataTable
        │   ├── TableHeader
        │   ├── TableBody
        │   └── TableFooter
        └── DataTablePagination
```

### Technology Stack
- **UI Framework**: React + TypeScript
- **Table Library**: @tanstack/react-table
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **API Client**: 기존 API 클라이언트 활용

## Components and Interfaces

### 1. MultiTableDataView Component

**Props Interface:**
```typescript
interface MultiTableDataViewProps {
  className?: string;
  defaultTable?: string;
}
```

**Features:**
- 다중 테이블 지원 (Order, User, DefectType, IncomingInspection 등)
- 테이블별 동적 컬럼 설정
- 테이블 전환 시 상태 관리
- 각 테이블별 API 엔드포인트 관리

### 2. TableSelector Component

**Props Interface:**
```typescript
interface TableSelectorProps {
  selectedTable: string;
  onTableChange: (table: string) => void;
  availableTables: TableConfig[];
}

interface TableConfig {
  key: string;
  name: string;
  icon?: string;
  description?: string;
}
```

**Features:**
- 테이블 선택 드롭다운
- 사용자 정의 뷰 목록
- 새 뷰 추가 기능
- 즐겨찾기 테이블 관리

### 2. DataTableToolbar Component

**Props Interface:**
```typescript
interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onRefresh: () => void;
  onExport: () => void;
}
```

**Features:**
- 전역 검색 입력
- 열별 필터 드롭다운
- 날짜 범위 필터 (DatePicker)
- 열 가시성 토글
- 데이터 새로고침 버튼
- 데이터 내보내기 버튼

### 3. DataTable Component

**Props Interface:**
```typescript
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  error?: string | null;
}
```

**Features:**
- TanStack Table 통합
- 정렬 가능한 열 헤더
- 행 선택 기능
- 반응형 테이블 레이아웃

### 4. DataTablePagination Component

**Props Interface:**
```typescript
interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}
```

**Features:**
- 페이지 크기 선택
- 페이지 네비게이션
- 총 행 수 표시

## Data Models

### Order Interface (Prisma 스키마 기반)
```typescript
interface Order {
  col0: number;                // ID (Primary Key)
  year?: number | null;        // 년
  month?: number | null;       // 월
  day?: number | null;         // 일
  category?: string | null;    // 분류
  finalorderNumber?: string | null;  // 발주번호
  orderNumber?: string | null; // 열1
  code?: string | null;        // 코드
  registration?: string | null; // 등록번호
  col2?: string | null;        // 열2
  customer?: string | null;    // 발주처
  productName?: string | null; // 제품명
  partName?: string | null;    // 부속명
  quantity?: number | null;    // 발주수량
  specification?: string | null; // 사양
  postProcess?: string | null; // 후공정
  production?: number | null;  // 생산
  remaining?: number | null;   // 잔여
  status?: string | null;      // 진행
  sample?: string | null;      // 견본
  shippingDate?: string | null; // 출하일
  dDay?: string | null;        // D-DAY
  manager?: string | null;     // 담당
  shipping?: string | null;    // 출하
  jig?: string | null;         // 지그
  registration2?: string | null; // 등록
  category2?: string | null;   // 구분
  unitPrice?: number | null;   // 단가
  orderAmount?: number | null; // 발주금액
  etc?: string | null;         // 기타
  category3?: string | null;   // 구분2
  salesManager?: string | null; // 매출담당
  createdAt: Date;             // 생성일
  updatedAt: Date;             // 수정일
}
```

### Table Column Configuration (Prisma Order 스키마 기반)
```typescript
const orderColumns: ColumnDef<Order>[] = [
  // 선택 체크박스 열
  {
    id: "select",
    header: ({ table }) => <Checkbox />,
    cell: ({ row }) => <Checkbox />,
  },
  // ID
  {
    accessorKey: "col0",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
  },
  // 발주번호
  {
    accessorKey: "finalorderNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="발주번호" />,
  },
  // 코드
  {
    accessorKey: "code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="코드" />,
  },
  // 발주처
  {
    accessorKey: "customer",
    header: ({ column }) => <DataTableColumnHeader column={column} title="발주처" />,
  },
  // 제품명
  {
    accessorKey: "productName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="제품명" />,
  },
  // 부속명
  {
    accessorKey: "partName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="부속명" />,
  },
  // 발주수량
  {
    accessorKey: "quantity",
    header: ({ column }) => <DataTableColumnHeader column={column} title="발주수량" />,
    cell: ({ row }) => <NumberCell value={row.getValue("quantity")} />,
  },
  // 사양
  {
    accessorKey: "specification",
    header: ({ column }) => <DataTableColumnHeader column={column} title="사양" />,
  },
  // 진행상태 (필터 가능)
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="진행상태" />,
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  // 출하일
  {
    accessorKey: "shippingDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="출하일" />,
    cell: ({ row }) => <DateStringCell dateString={row.getValue("shippingDate")} />,
  },
  // 담당
  {
    accessorKey: "manager",
    header: ({ column }) => <DataTableColumnHeader column={column} title="담당" />,
  },
  // 단가
  {
    accessorKey: "unitPrice",
    header: ({ column }) => <DataTableColumnHeader column={column} title="단가" />,
    cell: ({ row }) => <CurrencyCell amount={row.getValue("unitPrice")} />,
  },
  // 발주금액
  {
    accessorKey: "orderAmount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="발주금액" />,
    cell: ({ row }) => <CurrencyCell amount={row.getValue("orderAmount")} />,
  },
  // 생성일
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="생성일" />,
    cell: ({ row }) => <DateCell date={row.getValue("createdAt")} />,
  },
  // 액션 버튼
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];

// 추가 셀 컴포넌트 타입
interface NumberCellProps {
  value: number | null;
}

interface DateStringCellProps {
  dateString: string | null;
}

interface CurrencyCellProps {
  amount: number | null;
  currency?: string;
}

interface StatusBadgeProps {
  status: string | null;
}
```

## Error Handling

### API Error Handling
```typescript
interface ApiError {
  message: string;
  status: number;
  code?: string;
}

const handleApiError = (error: ApiError) => {
  switch (error.status) {
    case 404:
      return "주문 데이터를 찾을 수 없습니다.";
    case 500:
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    case 403:
      return "데이터에 접근할 권한이 없습니다.";
    default:
      return error.message || "알 수 없는 오류가 발생했습니다.";
  }
};
```

### Component Error Boundaries
- DataTable 컴포넌트 레벨에서 에러 캐치
- 사용자 친화적인 에러 메시지 표시
- 에러 발생 시 새로고침 옵션 제공

## Testing Strategy

### Unit Tests
- 각 컴포넌트의 렌더링 테스트
- 사용자 상호작용 테스트 (검색, 정렬, 필터링)
- API 호출 모킹 테스트
- 에러 상태 처리 테스트

### Integration Tests
- 전체 DataTable 워크플로우 테스트
- API와의 통합 테스트
- 페이지네이션 및 데이터 로딩 테스트

### Test Files Structure
```
src/
├── components/
│   └── data-table/
│       ├── __tests__/
│       │   ├── OrderDataTable.test.tsx
│       │   ├── DataTableToolbar.test.tsx
│       │   ├── DataTable.test.tsx
│       │   └── DataTablePagination.test.tsx
│       └── ...
```

## Performance Considerations

### Optimization Strategies
1. **가상화**: 대량 데이터 처리를 위한 행 가상화 구현
2. **메모이제이션**: React.memo, useMemo, useCallback 활용
3. **지연 로딩**: 페이지네이션을 통한 데이터 청크 로딩
4. **디바운싱**: 검색 입력에 대한 디바운스 처리

### Bundle Size Optimization
- Tree shaking을 위한 모듈 구조 최적화
- 필요한 shadcn/ui 컴포넌트만 import
- TanStack Table의 필요한 기능만 사용

## Accessibility

### WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 적절한 ARIA 레이블 및 역할
- 색상 대비 요구사항 충족
- 포커스 관리

### Semantic HTML
- 적절한 table, thead, tbody, tr, th, td 태그 사용
- 헤더와 데이터 셀의 명확한 연관성
- 정렬 상태에 대한 aria-sort 속성

## Date Filtering

### DateRangePicker Component
```typescript
interface DateRangePickerProps {
  onDateRangeChange: (range: { from: Date | null; to: Date | null }) => void;
  placeholder?: string;
}
```

**Features:**
- 시작일/종료일 선택
- 프리셋 날짜 범위 (오늘, 어제, 지난 7일, 지난 30일 등)
- 날짜 형식 검증
- 접근성 지원

### Date Filter Integration
- `createdAt` 필드: 생성일 기준 필터링
- `shippingDate` 필드: 출하일 기준 필터링 (문자열 파싱 필요)
- 복합 날짜 필터: year/month/day 필드 조합 필터링

## Multi-Table Configuration

### Available Tables
```typescript
const tableConfigs: Record<string, TableConfig> = {
  order: {
    key: 'order',
    name: '주문 관리',
    endpoint: '/api/orders',
    columns: orderColumns,
    searchableFields: ['finalorderNumber', 'customer', 'productName', 'partName'],
    filterableFields: ['status', 'category', 'manager'],
    dateFields: ['createdAt', 'shippingDate']
  },
  user: {
    key: 'user',
    name: '사용자 관리',
    endpoint: '/api/users',
    columns: userColumns,
    searchableFields: ['username', 'name'],
    filterableFields: ['role', 'isActive'],
    dateFields: ['createdAt', 'lastLoginAt']
  },
  defectType: {
    key: 'defectType',
    name: '불량 유형',
    endpoint: '/api/defect-types',
    columns: defectTypeColumns,
    searchableFields: ['name', 'description'],
    filterableFields: [],
    dateFields: ['createdAt']
  },
  incomingInspection: {
    key: 'incomingInspection',
    name: '수입 검사',
    endpoint: '/api/incoming-inspections',
    columns: incomingInspectionColumns,
    searchableFields: ['client', 'productName', 'partName'],
    filterableFields: ['status'],
    dateFields: ['inspectionDate', 'createdAt']
  }
};
```