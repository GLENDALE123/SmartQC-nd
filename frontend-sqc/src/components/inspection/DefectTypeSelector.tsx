"use client"

import React, { useState } from "react"
import { IconPlus, IconX, IconEdit, IconBug } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { Badge } from "@/components/ui/badge"
import { FloatingLabel } from "@/components/ui/floating-label/FloatingLabel"
import { cn } from "@/lib/utils"

interface DefectType {
  id: number
  name: string
  description?: string
  color?: string
}

interface DefectItem {
  id: string
  defectType?: DefectType
  customType?: string
  count: number | null
  details: string
  isSelected: boolean
  isEditing: boolean
}

interface DefectTypeSelectorProps {
  defectTypes: DefectType[]
  onTotalDefectChange?: (totalDefect: number) => void
  placeholder?: string
  totalQty?: number
}

export function DefectTypeSelector({ 
  defectTypes, 
  onTotalDefectChange,
  placeholder = "불량유형 선택",
  totalQty = 0
}: DefectTypeSelectorProps) {
  const [defectRows, setDefectRows] = useState<DefectItem[]>([])

  const addNewRow = () => {
    const newDefect: DefectItem = {
      id: Date.now().toString(),
      defectType: undefined,
      customType: undefined,
      count: null,
      details: "",
      isSelected: false,
      isEditing: false
    }
    setDefectRows(prev => [...prev, newDefect])
  }

  const updateRow = (id: string, field: 'defectType' | 'customType' | 'count' | 'details' | 'isSelected' | 'isEditing', value: any) => {
    setDefectRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ))
  }

  const removeRow = (id: string) => {
    setDefectRows(prev => prev.filter(row => row.id !== id))
  }

  const handleTypeSelect = (id: string, value: string) => {
    const selectedType = defectTypes.find(type => type.name === value)
    if (selectedType) {
      updateRow(id, 'defectType', selectedType)
      updateRow(id, 'customType', undefined)
    } else {
      updateRow(id, 'customType', value)
      updateRow(id, 'defectType', undefined)
    }
    updateRow(id, 'isSelected', true)
    updateRow(id, 'isEditing', false)
  }

  const handleEditClick = (id: string) => {
    updateRow(id, 'isEditing', true)
    updateRow(id, 'defectType', undefined)
    updateRow(id, 'customType', undefined)
  }

  // 불량 통계 계산
  const totalDefectQty = defectRows.reduce((sum, defect) => sum + (defect.count || 0), 0)
  const defectRate = totalQty > 0 ? ((totalDefectQty / totalQty) * 100).toFixed(1) : "0.0"

  // 총 불량 수량이 변경될 때마다 부모 컴포넌트에 알림
  React.useEffect(() => {
    if (onTotalDefectChange) {
      onTotalDefectChange(totalDefectQty)
    }
  }, [totalDefectQty])

  return (
    <div className="space-y-4">
      
      {/* 불량유형 행들 */}
      {defectRows.map((defect) => (
        <div key={defect.id} className="flex items-center gap-3">
          {/* 불량유형 선택/배지 영역 */}
          <div className="w-32 md:w-40 lg:w-48 flex justify-start items-center gap-2">
            <div className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              defect.isSelected && !defect.isEditing ? "w-8" : "w-full"
            )}>
              {!defect.isSelected ? (
                <Combobox
                  items={defectTypes
                    .filter(type => !defectRows.some(row => 
                      row.id !== defect.id && 
                      row.defectType && 
                      row.defectType.name === type.name
                    ))
                    .map(type => ({
                      value: type.name,
                      label: type.name,
                      description: type.description
                    }))}
                  placeholder={placeholder}
                  value={defect.defectType?.name || defect.customType || ""}
                  onValueChange={(value) => handleTypeSelect(defect.id, value)}
                  onCustomInput={(value) => handleTypeSelect(defect.id, value)}
                  className="w-full"
                  icon={<IconBug className="h-4 w-4 text-muted-foreground" />}
                />
              ) : defect.isEditing ? (
                <Combobox
                  items={defectTypes
                    .filter(type => !defectRows.some(row => 
                      row.id !== defect.id && 
                      row.defectType && 
                      row.defectType.name === type.name
                    ))
                    .map(type => ({
                      value: type.name,
                      label: type.name,
                      description: type.description
                    }))}
                  placeholder={placeholder}
                  value={defect.defectType?.name || defect.customType || ""}
                  onValueChange={(value) => handleTypeSelect(defect.id, value)}
                  onCustomInput={(value) => handleTypeSelect(defect.id, value)}
                  className="w-full"
                  icon={<IconBug className="h-4 w-4 text-muted-foreground" />}
                />
              ) : (
                <div 
                  className={cn(
                    "h-8 bg-muted rounded-md px-2 flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                  )}
                  onClick={() => handleEditClick(defect.id)}
                >
                  <IconBug className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              )}
            </div>
            
            {/* 배지 - 축소된 영역 밖에 배치 */}
            {defect.isSelected && !defect.isEditing && (
              defect.defectType ? (
                <Badge 
                  variant="secondary"
                  className={cn(defect.defectType.color, "text-white transition-all duration-200 text-xs ml-2 whitespace-nowrap")}
                >
                  {defect.defectType.name}
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1 transition-all duration-200 text-xs ml-2 whitespace-nowrap">
                  <IconEdit className="h-3 w-3" />
                  {defect.customType}
                </Badge>
              )
            )}
          </div>

          {/* 데스크탑: 기존 레이아웃 유지 */}
          {defect.isSelected && (
            <div className="flex gap-2 w-full">
              <div className="w-14 sm:w-20">
                <FloatingLabel
                  label="발견"
                  size="medium"
                  type="number"
                  value={defect.count || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateRow(defect.id, 'count', value === "" ? null : Number(value) || null);
                  }}
                  min="0"
                />
              </div>
              <div className="flex-[2_2_0%] min-w-0">
                <FloatingLabel
                  label="상세내용"
                  size="medium"
                  value={defect.details}
                  onChange={(e) => updateRow(defect.id, 'details', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* 삭제 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeRow(defect.id)}
          >
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* 불량 통계 - 숨김 처리 */}
      {defectRows.length > 0 && (
        <div className="hidden">
          <span>총 불량: {totalDefectQty}개</span>
          {totalQty > 0 && (
            <span>불량률: {defectRate}%</span>
          )}
        </div>
      )}

      {/* 불량 유형 추가 버튼 - 항상 표시 */}
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={addNewRow}
      >
        <IconPlus className="h-4 w-4" />
        불량 유형 추가
      </Button>
    </div>
  )
}