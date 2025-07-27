import { ChevronDownIcon, PlusIcon } from "@radix-ui/react-icons"
import { 
  ShoppingCartIcon, 
  UsersIcon, 
  AlertTriangleIcon, 
  PackageIcon,
  SettingsIcon,
  TruckIcon,
  UploadIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TableKey } from "@/types/models"
import { TableViewConfig } from "@/types/table-config"

// 테이블 아이콘 매핑
const tableIcons = {
  order: ShoppingCartIcon,
  user: UsersIcon,
  defectType: AlertTriangleIcon,
  incomingInspection: PackageIcon,
  processInspection: SettingsIcon,
  shipmentInspection: TruckIcon,
  uploadLog: UploadIcon,
} as const

// 테이블 정보 인터페이스
interface TableInfo {
  key: TableKey
  name: string
  description?: string
  badge?: string | number
  disabled?: boolean
}

// 테이블 선택기 프롭스
export interface TableSelectorProps {
  currentTable: TableKey
  onTableChange: (table: TableKey) => void
  tables: TableInfo[]
  views?: TableViewConfig[]
  onViewSelect?: (viewId: string) => void
  onViewCreate?: () => void
  onViewEdit?: (viewId: string) => void
  onViewDelete?: (viewId: string) => void
  className?: string
  disabled?: boolean
}

export function TableSelector({
  currentTable,
  onTableChange,
  tables,
  views = [],
  onViewSelect,
  onViewCreate,
  className,
  disabled = false,
}: TableSelectorProps) {
  const currentTableInfo = tables.find(table => table.key === currentTable)
  const currentTableViews = views.filter(view => view.tableKey === currentTable)
  const CurrentIcon = currentTableInfo ? tableIcons[currentTableInfo.key] : ShoppingCartIcon

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {/* 테이블 선택 드롭다운 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center space-x-2">
              <CurrentIcon className="h-4 w-4" />
              <span>{currentTableInfo?.name || "테이블 선택"}</span>
              {currentTableInfo?.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {currentTableInfo.badge}
                </Badge>
              )}
            </div>
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[280px]" align="start">
          <DropdownMenuLabel>테이블 선택</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {tables.map((table) => {
            const Icon = tableIcons[table.key]
            const isSelected = table.key === currentTable
            
            return (
              <DropdownMenuItem
                key={table.key}
                onClick={() => !table.disabled && onTableChange(table.key)}
                disabled={table.disabled}
                className={cn(
                  "flex items-center space-x-2 cursor-pointer",
                  isSelected && "bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{table.name}</div>
                  {table.description && (
                    <div className="text-xs text-muted-foreground">
                      {table.description}
                    </div>
                  )}
                </div>
                {table.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {table.badge}
                  </Badge>
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 뷰 관리 섹션 (미래 확장성용) */}
      {currentTableViews.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              저장된 뷰
            </span>
            {onViewCreate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewCreate}
                className="h-6 w-6 p-0"
                disabled={disabled}
              >
                <PlusIcon className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="space-y-1">
            {currentTableViews.map((view) => (
              <Button
                key={view.id}
                variant="ghost"
                size="sm"
                onClick={() => onViewSelect?.(view.id)}
                className="w-full justify-start text-xs"
                disabled={disabled}
              >
                <span className="truncate">{view.name}</span>
                {view.isDefault && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    기본
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 간단한 테이블 선택기 (드롭다운 없이)
export interface SimpleTableSelectorProps {
  currentTable: TableKey
  onTableChange: (table: TableKey) => void
  tables: TableInfo[]
  className?: string
  disabled?: boolean
}

export function SimpleTableSelector({
  currentTable,
  onTableChange,
  tables,
  className,
  disabled = false,
}: SimpleTableSelectorProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {tables.map((table) => {
        const Icon = tableIcons[table.key]
        const isSelected = table.key === currentTable
        
        return (
          <Button
            key={table.key}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => !table.disabled && onTableChange(table.key)}
            disabled={table.disabled || disabled}
            className="flex items-center space-x-1"
          >
            <Icon className="h-3 w-3" />
            <span className="text-xs">{table.name}</span>
            {table.badge && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {table.badge}
              </Badge>
            )}
          </Button>
        )
      })}
    </div>
  )
}