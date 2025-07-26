"use client"

import { IconEdit, IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  count: number
  details: string
}

interface DefectListProps {
  defects: DefectItem[]
  onRemoveDefect: (id: string) => void
  onUpdateDefectCount: (id: string, count: number) => void
  onUpdateDefectDetails: (id: string, details: string) => void
}

export function DefectList({ 
  defects, 
  onRemoveDefect, 
  onUpdateDefectCount, 
  onUpdateDefectDetails 
}: DefectListProps) {
  if (defects.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {defects.map((defect) => (
        <div key={defect.id} className="flex items-center gap-3">
          {/* 불량유형 배지 */}
          <div className="flex items-center gap-2">
            {defect.defectType ? (
              <Badge 
                variant="secondary"
                className={cn(defect.defectType.color, "text-white")}
              >
                {defect.defectType.name}
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <IconEdit className="h-3 w-3" />
                {defect.customType}
              </Badge>
            )}
          </div>

          {/* 수량 입력 */}
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor={`count-${defect.id}`}>발견</Label>
            <Input
              id={`count-${defect.id}`}
              type="number"
              value={defect.count}
              onChange={(e) => onUpdateDefectCount(defect.id, Number(e.target.value))}
              placeholder="0"
              className="w-20"
            />
          </div>

          {/* 상세내용 입력 */}
          <div className="grid w-full max-w-sm items-center gap-1.5 flex-1">
            <Label htmlFor={`details-${defect.id}`}>상세내용</Label>
            <Input
              id={`details-${defect.id}`}
              value={defect.details}
              onChange={(e) => onUpdateDefectDetails(defect.id, e.target.value)}
              placeholder="불량 상세 내용을 입력하세요"
              className="flex-1"
            />
          </div>

          {/* 삭제 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemoveDefect(defect.id)}
          >
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
} 