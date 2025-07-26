"use client"

import { useState } from "react"
import { IconPhoto } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"

import { InspectionRoundSelector } from "./InspectionRoundSelector"

interface WorkerDefect {
  id: string
  workerName: string
  inspectionQuantity: number | null
  totalDefectCount: number
  defectTypes: any[]
}

interface InspectionRound {
  id: string
  roundNumber: number
  inspectionDate: string
  inspectionQuantity: number | null
  totalDefectiveQuantity: number | null
  workerDefects: WorkerDefect[]
}

interface ShipmentInspectionFormData {
  inspectionRounds: InspectionRound[]
  inspectionDate: string
  finalPeelTestResult: string
  conditionalPassReason: string
  externalOrderCheck: boolean
  specialNotes: string
  photos: File[]
}

const PEEL_TEST_OPTIONS = [
  { value: "select", label: "선택" },
  { value: "pass", label: "합격" },
  { value: "fail", label: "불합격" },
  { value: "conditional_pass", label: "조건부합격" }
]

export function ShipmentInspectionForm() {
  const [formData, setFormData] = useState<ShipmentInspectionFormData>({
    inspectionRounds: [{
      id: "1",
      roundNumber: 1,
      inspectionDate: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      inspectionQuantity: null,
      totalDefectiveQuantity: null,
      workerDefects: [{
        id: "1",
        workerName: "",
        inspectionQuantity: null,
        totalDefectCount: 0,
        defectTypes: []
      }]
    }],
    inspectionDate: new Date().toISOString().split('T')[0],
    finalPeelTestResult: "select",
    conditionalPassReason: "",
    externalOrderCheck: false,
    specialNotes: "",
    photos: []
  })

  // 폼 데이터 업데이트 함수
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 검사 회차 변경 핸들러
  const handleInspectionRoundsChange = (rounds: InspectionRound[]) => {
    setFormData(prev => ({
      ...prev,
      inspectionRounds: rounds
    }))
  }

  // 사진 업로드 핸들러
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }))
    }
  }

  // 사진 삭제 핸들러
  const removePhoto = (index: number) => {
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }))
  }

  return (
    <Card className="border-transparent shadow-none p-0 px-1 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* 검사일자 */}
        <div className="space-y-4">
          <h4 className="text-md font-medium">검사일자</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>검사일자</Label>
              <Input 
                type="date"
                value={formData.inspectionDate}
                onChange={(e) => updateFormData('inspectionDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 검사 회차 선택기 */}
        <InspectionRoundSelector
          inspectionRounds={formData.inspectionRounds}
          onInspectionRoundsChange={handleInspectionRoundsChange}
        />

        {/* 최종 박리 테스트 결과 */}
        <div className="space-y-4">
          <h4 className="text-md font-medium">최종 박리 테스트 결과</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>박리 테스트 결과</Label>
              <Select value={formData.finalPeelTestResult} onValueChange={(value) => updateFormData('finalPeelTestResult', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="박리 테스트 결과 선택" />
                </SelectTrigger>
                <SelectContent>
                  {PEEL_TEST_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.finalPeelTestResult === "conditional_pass" && (
              <div className="space-y-2">
                <Label>조건부합격 사유</Label>
                <Input 
                  value={formData.conditionalPassReason}
                  onChange={(e) => updateFormData('conditionalPassReason', e.target.value)}
                  placeholder="조건부합격 사유를 입력하세요"
                />
              </div>
            )}
          </div>
        </div>

        {/* 외주 검수 박스 체크 여부 */}
        <div className="space-y-4">
          <h4 className="text-md font-medium">외주 검수 박스 체크 여부</h4>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="externalOrderCheck"
              checked={formData.externalOrderCheck}
              onCheckedChange={(checked) => updateFormData('externalOrderCheck', checked)}
            />
            <Label htmlFor="externalOrderCheck">외주 검수 박스 체크 완료</Label>
          </div>
        </div>

        {/* 특이사항/조치사항 */}
        <div className="space-y-4">
          <h4 className="text-md font-medium">특이사항/조치사항</h4>
          <Textarea 
            value={formData.specialNotes}
            onChange={(e) => updateFormData('specialNotes', e.target.value)}
            placeholder="특이사항이나 조치사항을 입력하세요"
            rows={3}
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
                onClick={() => document.getElementById('photo-upload-mobile')?.click()}
                className="flex items-center gap-2 w-full"
              >
                <IconPhoto className="h-4 w-4" />
                사진 첨부
              </Button>
              <Input 
                id="photo-upload-mobile"
                type="file" 
                multiple 
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
          {formData.photos.length > 0 && (
            <div className="space-y-2">
              <Label>업로드된 사진</Label>
              <div className="grid grid-cols-3 gap-2">
                {formData.photos.map((photo, index) => (
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

        {/* 하단 버튼들 */}
        <div className="flex justify-end gap-2">
          <Button variant="outline">취소</Button>
          <Button>저장</Button>
        </div>
      </div>
    </Card>
  )
} 