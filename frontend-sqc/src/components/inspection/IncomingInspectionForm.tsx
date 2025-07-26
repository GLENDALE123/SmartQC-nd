"use client"

import { useState, useCallback } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { IconPhoto } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { DefectTypeSelector } from "./DefectTypeSelector"
import { cn } from "@/lib/utils"

interface OrderInfo {
  orderNumber: string
  client: string
  productName: string
  partName: string
  specification: string
  manager: string
}

interface DefectType {
  id: number
  name: string
  description?: string
  color?: string
}



interface IncomingInspectionFormProps {
  orderInfos: OrderInfo[]
}

// 샘플 불량유형 데이터 (실제로는 API에서 가져올 예정)
const SAMPLE_DEFECT_TYPES: DefectType[] = [
  { id: 1, name: "표면 스크래치", description: "제품 표면에 스크래치 발생", color: "bg-red-500" },
  { id: 2, name: "색상 불일치", description: "요구 색상과 불일치", color: "bg-yellow-500" },
  { id: 3, name: "치수 불량", description: "치수 사양 불일치", color: "bg-blue-500" },
  { id: 4, name: "조립 불량", description: "조립 상태 불량", color: "bg-purple-500" },
  { id: 5, name: "포장 불량", description: "포장 상태 불량", color: "bg-orange-500" },
]

export function IncomingInspectionForm({ orderInfos }: IncomingInspectionFormProps) {
  const [inspectionDate, setInspectionDate] = useState<Date>(new Date())
  const [totalQty, setTotalQty] = useState<number>(0)
  const [notes, setNotes] = useState<string>("")
  const [photos, setPhotos] = useState<File[]>([])

  // 불량유형 추가
  const addDefect = useCallback((defectTypeName: string, count: number, details: string) => {
    console.log('불량유형 추가:', { defectTypeName, count, details })
  }, [])

  // 사진 업로드 핸들러
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setPhotos(prev => [...prev, ...files])
    }
  }

  // 사진 삭제 핸들러
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }





  return (
    <Card className="border-transparent shadow-none max-w-4xl mx-auto">
      <CardContent className="space-y-6 p-0 px-1 w-full">
        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 검사일자 */}
          <div className="space-y-2">
            <Label htmlFor="inspection-date">검사일자</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !inspectionDate && "text-muted-foreground"
                  )}
                >
                  {inspectionDate ? (
                    format(inspectionDate, "yyyy.MM.dd", { locale: ko })
                  ) : (
                    <span>날짜를 선택하세요</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={inspectionDate}
                  onSelect={(date) => date && setInspectionDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 총 검사수 */}
          <div className="space-y-2">
            <Label htmlFor="total-qty">총 검사수</Label>
            <div className="relative">
              <Input
                id="total-qty"
                type="number"
                value={totalQty}
                onChange={(e) => setTotalQty(Number(e.target.value))}
                placeholder="0"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                개
              </span>
            </div>
          </div>
        </div>

        {/* 불량유형 섹션 */}
        <DefectTypeSelector
          defectTypes={SAMPLE_DEFECT_TYPES}
          onAddDefect={addDefect}
          totalQty={totalQty}
        />

        {/* 특이사항/조치사항 */}
        <div className="space-y-2">
          <Label htmlFor="notes">특이사항/조치사항</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="특이사항이나 조치사항을 입력하세요"
            className="min-h-[100px]"
          />
        </div>

        {/* 사진 첨부 */}
        <div className="space-y-4">
          <h4 className="text-md font-medium flex items-center gap-2">
            <IconPhoto className="h-4 w-4" />
            사진 첨부
          </h4>
          <div className="space-y-2">
            {/* 데스크탑: 기존 파일 업로드 */}
            <div className="hidden sm:block">
              <Input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handlePhotoUpload}
                className="cursor-pointer"
              />
            </div>
            {/* 모바일: 아이콘+텍스트 버튼 */}
            <div className="block sm:hidden">
              <Button
                variant="outline"
                onClick={() => document.getElementById('photo-upload-mobile-incoming')?.click()}
                className="flex items-center gap-2 w-full"
              >
                <IconPhoto className="h-4 w-4" />
                사진 첨부
              </Button>
              <Input 
                id="photo-upload-mobile-incoming"
                type="file" 
                multiple 
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
          {photos.length > 0 && (
            <div className="space-y-2">
              <Label>업로드된 사진</Label>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={URL.createObjectURL(photo)} 
                      alt={`사진 ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removePhoto(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline">임시저장</Button>
          <Button>검사 완료</Button>
        </div>
      </CardContent>
    </Card>
  )
} 