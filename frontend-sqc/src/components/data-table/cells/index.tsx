// 공통 셀 컴포넌트들

import { format, parseISO, isValid } from "date-fns"
import { ko } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { statusBadgeVariants, getStatusVariant } from "@/lib/data-table-styles"

// 숫자 셀 컴포넌트
export interface NumberCellProps {
  value: number | null | undefined
  className?: string
  format?: 'default' | 'decimal' | 'integer'
  decimalPlaces?: number
}

export function NumberCell({ 
  value, 
  className, 
  format = 'default',
  decimalPlaces = 0 
}: NumberCellProps) {
  if (value === null || value === undefined) {
    return (
      <span className={cn("data-table-cell-empty", className)}>
        -
      </span>
    )
  }

  let formattedValue: string
  
  switch (format) {
    case 'decimal':
      formattedValue = value.toFixed(decimalPlaces)
      break
    case 'integer':
      formattedValue = Math.round(value).toString()
      break
    default:
      formattedValue = value.toLocaleString('ko-KR')
  }

  return (
    <span className={cn("data-table-cell-number", className)}>
      {formattedValue}
    </span>
  )
}

// 통화 셀 컴포넌트
export interface CurrencyCellProps {
  amount: number | null | undefined
  currency?: string
  className?: string
}

export function CurrencyCell({ 
  amount, 
  currency = 'KRW', 
  className 
}: CurrencyCellProps) {
  if (amount === null || amount === undefined) {
    return (
      <span className={cn("data-table-cell-empty", className)}>
        -
      </span>
    )
  }

  const formattedAmount = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  return (
    <span className={cn(
      "data-table-cell-currency",
      amount >= 0 ? "data-table-cell-currency-positive" : "data-table-cell-currency-negative",
      className
    )}>
      {formattedAmount}
    </span>
  )
}

// 날짜 셀 컴포넌트
export interface DateCellProps {
  date: Date | string | null | undefined
  className?: string
  formatString?: string
  showTime?: boolean
}

export function DateCell({ 
  date, 
  className, 
  formatString,
  showTime = false 
}: DateCellProps) {
  if (!date) {
    return (
      <span className={cn("data-table-cell-empty", className)}>
        -
      </span>
    )
  }

  let dateObj: Date
  
  if (typeof date === 'string') {
    dateObj = parseISO(date)
  } else {
    dateObj = date
  }

  if (!isValid(dateObj)) {
    return (
      <span className={cn("text-destructive text-sm", className)}>
        잘못된 날짜
      </span>
    )
  }

  const defaultFormat = showTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd'
  const formattedDate = format(dateObj, formatString || defaultFormat, { locale: ko })

  return (
    <span className={cn("data-table-cell-date", className)}>
      {formattedDate}
    </span>
  )
}

// 날짜 문자열 셀 컴포넌트 (shippingDate 같은 문자열 날짜용)
export interface DateStringCellProps {
  dateString: string | null | undefined
  className?: string
}

export function DateStringCell({ dateString, className }: DateStringCellProps) {
  if (!dateString) {
    return <span className={cn("text-muted-foreground", className)}>-</span>
  }

  // 문자열 날짜를 파싱 시도
  const parsedDate = new Date(dateString)
  
  if (isValid(parsedDate)) {
    return <DateCell date={parsedDate} className={className} />
  }

  // 파싱에 실패하면 원본 문자열 표시
  return (
    <span className={cn("font-mono text-sm", className)}>
      {dateString}
    </span>
  )
}

// 상태 배지 셀 컴포넌트
export interface StatusBadgeProps {
  status: string | null | undefined
  className?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) {
    return (
      <span className={cn("data-table-cell-empty", className)}>
        -
      </span>
    )
  }

  const statusVariant = getStatusVariant(status)

  return (
    <Badge 
      className={cn(
        statusBadgeVariants({ status: statusVariant }),
        className
      )}
    >
      {status}
    </Badge>
  )
}

// 불린 셀 컴포넌트
export interface BooleanCellProps {
  value: boolean | null | undefined
  className?: string
  trueLabel?: string
  falseLabel?: string
}

export function BooleanCell({ 
  value, 
  className, 
  trueLabel = '예', 
  falseLabel = '아니오' 
}: BooleanCellProps) {
  if (value === null || value === undefined) {
    return <span className={cn("text-muted-foreground", className)}>-</span>
  }

  return (
    <Badge variant={value ? 'default' : 'secondary'} className={className}>
      {value ? trueLabel : falseLabel}
    </Badge>
  )
}

// 배열 셀 컴포넌트 (orderNumbers 같은 배열 필드용)
export interface ArrayCellProps {
  values: string[] | null | undefined
  className?: string
  maxDisplay?: number
  separator?: string
}

export function ArrayCell({ 
  values, 
  className, 
  maxDisplay = 3 
}: ArrayCellProps) {
  if (!values || values.length === 0) {
    return <span className={cn("text-muted-foreground", className)}>-</span>
  }

  const displayValues = values.slice(0, maxDisplay)
  const hasMore = values.length > maxDisplay

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayValues.map((value, index) => (
        <Badge key={index} variant="outline" className="text-xs">
          {value}
        </Badge>
      ))}
      {hasMore && (
        <Badge variant="secondary" className="text-xs">
          +{values.length - maxDisplay}
        </Badge>
      )}
    </div>
  )
}

// 색상 셀 컴포넌트 (DefectType의 color 필드용)
export interface ColorCellProps {
  color: string | null | undefined
  className?: string
}

export function ColorCell({ color, className }: ColorCellProps) {
  if (!color) {
    return <span className={cn("text-muted-foreground", className)}>-</span>
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div 
        className="w-4 h-4 rounded border border-border"
        style={{ backgroundColor: color }}
      />
      <span className="font-mono text-sm">{color}</span>
    </div>
  )
}

// 선택 체크박스 셀 컴포넌트
export interface SelectCellProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function SelectCell({ 
  checked, 
  onCheckedChange, 
  disabled = false, 
  className 
}: SelectCellProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={className}
      aria-label="행 선택"
    />
  )
}

// 텍스트 셀 컴포넌트 (기본)
export interface TextCellProps {
  value: string | null | undefined
  className?: string
  maxLength?: number
  showTooltip?: boolean
}

export function TextCell({ 
  value, 
  className, 
  maxLength,
  showTooltip = false 
}: TextCellProps) {
  if (!value) {
    return <span className={cn("text-muted-foreground", className)}>-</span>
  }

  const displayValue = maxLength && value.length > maxLength 
    ? `${value.substring(0, maxLength)}...` 
    : value

  return (
    <span 
      className={className}
      title={showTooltip ? value : undefined}
    >
      {displayValue}
    </span>
  )
}