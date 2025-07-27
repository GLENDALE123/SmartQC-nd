import { useState } from "react"

import { cn } from "@/lib/utils"
import { TableKey } from "@/types/models"
import { TableSelector } from "./table-selector"
import { OrderDataTable } from "./order-data-table"

// 다중 테이블 데이터 뷰 프롭스
export interface MultiTableDataViewProps {
  className?: string
  defaultTable?: TableKey
  showTableSelector?: boolean
  sidebarWidth?: number
  onTableChange?: (table: TableKey) => void
}

export function MultiTableDataView({
  className,
  defaultTable = 'order',
  showTableSelector = true,
  sidebarWidth = 280,
}: MultiTableDataViewProps) {
  const [currentTable, setCurrentTable] = useState<TableKey>(defaultTable)

  // 현재 테이블에 따른 컴포넌트 렌더링
  const renderTableComponent = () => {
    switch (currentTable) {
      case 'order':
        return <OrderDataTable />
      
      // 미래 확장성을 위한 다른 테이블들 (현재는 구현되지 않음)
      case 'user':
      case 'defectType':
      case 'incomingInspection':
      case 'processInspection':
      case 'shipmentInspection':
      case 'uploadLog':
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">준비 중</p>
              <p className="text-sm">이 테이블은 아직 구현되지 않았습니다.</p>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">테이블을 선택해주세요</p>
              <p className="text-sm">왼쪽에서 보고 싶은 테이블을 선택하세요.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={cn("flex h-full bg-background", className)}>
      {/* 테이블 선택 사이드바 */}
      {showTableSelector && (
        <div 
          className={cn(
            "border-r border-border bg-card/50 backdrop-blur-sm",
            "supports-[backdrop-filter]:bg-card/80",
            "flex-shrink-0 overflow-y-auto"
          )}
          style={{ width: sidebarWidth }}
        >
          <div className="p-6">
            {/* 사이드바 헤더 */}
            <div className="mb-6 space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                데이터 테이블
              </h3>
              <p className="text-sm text-muted-foreground">
                보고 싶은 테이블을 선택하세요
              </p>
            </div>
            
            {/* 테이블 선택기 */}
            <div className="space-y-4">
              <TableSelector
                currentTable={currentTable}
                onTableChange={setCurrentTable}
                tables={[
                  {
                    key: 'order' as TableKey,
                    name: '주문 관리',
                    description: '주문 데이터를 관리합니다',
                    disabled: false,
                  },
                  {
                    key: 'user' as TableKey,
                    name: '사용자 관리',
                    description: '사용자 계정을 관리합니다',
                    disabled: true, // 미래 확장성용으로 비활성화
                  },
                  {
                    key: 'defectType' as TableKey,
                    name: '불량 유형',
                    description: '불량 유형을 관리합니다',
                    disabled: true, // 미래 확장성용으로 비활성화
                  },
                  {
                    key: 'incomingInspection' as TableKey,
                    name: '수입 검사',
                    description: '수입 검사 데이터를 관리합니다',
                    disabled: true, // 미래 확장성용으로 비활성화
                  },
                  {
                    key: 'processInspection' as TableKey,
                    name: '공정 검사',
                    description: '공정 검사 데이터를 관리합니다',
                    disabled: true, // 미래 확장성용으로 비활성화
                  },
                  {
                    key: 'shipmentInspection' as TableKey,
                    name: '출하 검사',
                    description: '출하 검사 데이터를 관리합니다',
                    disabled: true, // 미래 확장성용으로 비활성화
                  },
                  {
                    key: 'uploadLog' as TableKey,
                    name: '업로드 로그',
                    description: '파일 업로드 기록을 관리합니다',
                    disabled: true, // 미래 확장성용으로 비활성화
                  },
                ]}
                className="w-full"
              />
              
              {/* 추가 정보 또는 통계 (미래 확장성) */}
              <div className="pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  현재 1개 테이블 사용 가능
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메인 테이블 컨테이너 */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 space-y-6">
          {/* 테이블 헤더 (현재 테이블 정보) */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">
                {currentTable === 'order' ? '주문 관리' : '테이블'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentTable === 'order' ? '주문 데이터를 관리합니다' : '데이터를 관리합니다'}
              </p>
            </div>
          </div>
          
          {/* 테이블 컨텐츠 */}
          <div className="flex-1">
            {renderTableComponent()}
          </div>
        </div>
      </div>
    </div>
  )
}

// 간단한 버전 (사이드바 없이)
export interface SimpleMultiTableDataViewProps {
  className?: string
  defaultTable?: TableKey
  onTableChange?: (table: TableKey) => void
}

export function SimpleMultiTableDataView({
  className,
  defaultTable = 'order',
}: SimpleMultiTableDataViewProps) {
  const [currentTable] = useState<TableKey>(defaultTable)

  // 현재 테이블에 따른 컴포넌트 렌더링
  const renderTableComponent = () => {
    switch (currentTable) {
      case 'order':
        return <OrderDataTable />
      
      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">준비 중</p>
              <p className="text-sm">이 테이블은 아직 구현되지 않았습니다.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="p-6 space-y-6">
        {/* 테이블 헤더 */}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">
            {currentTable === 'order' ? '주문 관리' : '테이블'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {currentTable === 'order' ? '주문 데이터를 관리합니다' : '데이터를 관리합니다'}
          </p>
        </div>
        
        {/* 테이블 컨텐츠 */}
        <div className="flex-1">
          {renderTableComponent()}
        </div>
      </div>
    </div>
  )
}