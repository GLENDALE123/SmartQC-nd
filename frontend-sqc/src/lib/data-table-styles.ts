/**
 * DataTable 컴포넌트를 위한 재사용 가능한 스타일 유틸리티
 * 컴포넌트별 기본 스타일 클래스 정의 및 variant 클래스 생성
 */

import { type VariantProps, cva } from "class-variance-authority"

// DataTable 컨테이너 variants
export const dataTableContainerVariants = cva(
  "data-table-container",
  {
    variants: {
      size: {
        sm: "space-y-2",
        md: "space-y-3",
        lg: "space-y-4",
      },
      density: {
        compact: "text-sm",
        normal: "",
        comfortable: "text-base",
      },
    },
    defaultVariants: {
      size: "md",
      density: "normal",
    },
  }
)

// DataTable 래퍼 variants
export const dataTableWrapperVariants = cva(
  "data-table-wrapper",
  {
    variants: {
      variant: {
        default: "",
        bordered: "border-2",
        elevated: "shadow-md",
        flat: "shadow-none border-0 bg-transparent",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-lg",
        lg: "rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      rounded: "md",
    },
  }
)

// DataTable 행 variants
export const dataTableRowVariants = cva(
  "data-table-row",
  {
    variants: {
      striped: {
        true: "",
        false: "bg-background",
      },
      hover: {
        true: "hover:bg-muted/50",
        false: "",
      },
      selected: {
        true: "data-[state=selected]:bg-muted",
        false: "",
      },
    },
    defaultVariants: {
      striped: true,
      hover: true,
      selected: true,
    },
  }
)

// DataTable 셀 variants
export const dataTableCellVariants = cva(
  "data-table-cell",
  {
    variants: {
      padding: {
        sm: "px-2 py-1",
        md: "px-4 py-3",
        lg: "px-6 py-4",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      bordered: {
        true: "border-r border-border/30 last:border-r-0",
        false: "",
      },
    },
    defaultVariants: {
      padding: "md",
      align: "left",
      bordered: true,
    },
  }
)

// 툴바 variants
export const dataTableToolbarVariants = cva(
  "data-table-toolbar",
  {
    variants: {
      variant: {
        default: "",
        minimal: "border-0 shadow-none bg-transparent p-2",
        elevated: "shadow-md",
      },
      layout: {
        horizontal: "flex-row items-center",
        vertical: "flex-col",
        responsive: "flex-col sm:flex-row",
      },
    },
    defaultVariants: {
      variant: "default",
      layout: "responsive",
    },
  }
)

// 버튼 variants (DataTable 전용)
export const dataTableButtonVariants = cva(
  "data-table-button",
  {
    variants: {
      variant: {
        default: "data-table-button",
        ghost: "hover:bg-accent/50",
        outline: "border border-border",
        destructive: "hover:bg-destructive/10 hover:text-destructive",
      },
      size: {
        sm: "data-table-button-sm",
        md: "h-9 px-4",
        lg: "h-10 px-6",
        icon: "data-table-button-icon",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

// 상태 배지 variants
export const statusBadgeVariants = cva(
  "data-table-status-badge",
  {
    variants: {
      status: {
        completed: "data-table-status-completed",
        progress: "data-table-status-progress",
        pending: "data-table-status-pending",
        hold: "data-table-status-hold",
        cancelled: "data-table-status-cancelled",
      },
      size: {
        sm: "text-xs px-1.5 py-0.5",
        md: "text-xs px-2 py-1",
        lg: "text-sm px-3 py-1.5",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "md",
    },
  }
)

// 셀 타입별 variants
export const cellVariants = {
  number: cva("data-table-cell-number", {
    variants: {
      align: {
        left: "text-left",
        right: "text-right",
      },
      format: {
        default: "",
        currency: "data-table-cell-currency",
        percentage: "after:content-['%']",
      },
    },
    defaultVariants: {
      align: "right",
      format: "default",
    },
  }),
  
  date: cva("data-table-cell-date", {
    variants: {
      format: {
        short: "",
        long: "px-3 py-1.5",
        relative: "bg-transparent px-0 py-0 text-foreground",
      },
    },
    defaultVariants: {
      format: "short",
    },
  }),
  
  text: cva("", {
    variants: {
      truncate: {
        true: "truncate",
        false: "",
        lines2: "truncate-2",
        lines3: "truncate-3",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
      },
    },
    defaultVariants: {
      truncate: false,
      weight: "normal",
    },
  }),
}

// 페이지네이션 variants
export const paginationVariants = cva(
  "data-table-pagination",
  {
    variants: {
      variant: {
        default: "",
        minimal: "border-0 shadow-none bg-transparent p-2",
        compact: "p-2 gap-2",
      },
      layout: {
        horizontal: "flex-row items-center",
        vertical: "flex-col",
        responsive: "flex-col sm:flex-row sm:items-center",
      },
    },
    defaultVariants: {
      variant: "default",
      layout: "responsive",
    },
  }
)

// 사이드바 variants
export const sidebarVariants = cva(
  "data-table-sidebar",
  {
    variants: {
      variant: {
        default: "",
        minimal: "bg-transparent border-0",
        elevated: "shadow-lg",
      },
      width: {
        sm: "w-48",
        md: "w-64",
        lg: "w-80",
        xl: "w-96",
      },
    },
    defaultVariants: {
      variant: "default",
      width: "md",
    },
  }
)

// 타입 정의
export type DataTableContainerVariants = VariantProps<typeof dataTableContainerVariants>
export type DataTableWrapperVariants = VariantProps<typeof dataTableWrapperVariants>
export type DataTableRowVariants = VariantProps<typeof dataTableRowVariants>
export type DataTableCellVariants = VariantProps<typeof dataTableCellVariants>
export type DataTableToolbarVariants = VariantProps<typeof dataTableToolbarVariants>
export type DataTableButtonVariants = VariantProps<typeof dataTableButtonVariants>
export type StatusBadgeVariants = VariantProps<typeof statusBadgeVariants>
export type PaginationVariants = VariantProps<typeof paginationVariants>
export type SidebarVariants = VariantProps<typeof sidebarVariants>

// 헬퍼 함수들
export function getStatusVariant(status: string): StatusBadgeVariants['status'] {
  const normalizedStatus = status?.toLowerCase().trim()
  
  // 한국어 상태값 매핑
  switch (normalizedStatus) {
    case '작업완료':
    case '완료':
    case 'completed':
    case 'complete':
    case 'done':
      return 'completed'
    
    case '작업중':
    case '진행중':
    case 'progress':
    case 'in-progress':
    case 'in progress':
    case 'working':
    case 'processing':
      return 'progress'
    
    case '작업대기':
    case '대기':
    case 'pending':
    case 'waiting':
    case 'standby':
      return 'pending'
    
    case '보류':
    case 'hold':
    case 'on-hold':
    case 'on hold':
    case 'paused':
      return 'hold'
    
    case '취소':
    case 'cancelled':
    case 'canceled':
    case 'cancel':
      return 'cancelled'
    
    default:
      return 'pending'
  }
}

export const getCurrencyColor = (amount: number): string => {
  if (amount >= 0) {
    return "data-table-cell-currency-positive"
  } else {
    return "data-table-cell-currency-negative"
  }
}

// 접근성 헬퍼
export const getAriaLabel = {
  sortAscending: (column: string) => `${column} 열을 오름차순으로 정렬`,
  sortDescending: (column: string) => `${column} 열을 내림차순으로 정렬`,
  sortNone: (column: string) => `${column} 열 정렬 안함`,
  selectRow: (index: number) => `${index + 1}번째 행 선택`,
  selectAllRows: "모든 행 선택",
  pagination: {
    first: "첫 페이지로 이동",
    previous: "이전 페이지로 이동",
    next: "다음 페이지로 이동",
    last: "마지막 페이지로 이동",
    pageInfo: (current: number, total: number) => `${total}페이지 중 ${current}페이지`,
  },
  filter: {
    search: "테이블 검색",
    dateRange: "날짜 범위 선택",
    reset: "필터 초기화",
  },
}

// 반응형 헬퍼
export const responsiveClasses = {
  hideOnMobile: "hidden sm:block",
  hideOnTablet: "hidden lg:block",
  showOnMobile: "block sm:hidden",
  mobileStack: "flex-col sm:flex-row",
  mobileCenter: "justify-center sm:justify-start",
}

// 테마 관련 헬퍼
export const themeClasses = {
  lightOnly: "dark:hidden",
  darkOnly: "hidden dark:block",
  themeTransition: "transition-colors duration-200",
  glassmorphism: "backdrop-blur-sm bg-background/80 supports-[backdrop-filter]:bg-background/60",
}