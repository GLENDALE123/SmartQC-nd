"use client"

import { useState, useEffect } from "react"
import { IconFileText, IconClipboardList, IconCalendar, IconSettings, IconPhoto } from "@tabler/icons-react"
import { useAuth } from "@/hooks/useAuth"
import { getLocalStorageWithTTL, setLocalStorageWithTTL } from "@/utils/localStorage"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { Toggle } from "@/components/ui/toggle"
import { DefectTypeSelector } from "./DefectTypeSelector"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

interface OrderInfo {
  orderNumber: string
  client: string
  productName: string
  partName: string
  specification: string
  manager: string
}

interface ProcessInspectionFormProps {
  orderInfos: OrderInfo[]
}

// 공정검사 전용 섹션들
const PROCESS_INSPECTION_SECTIONS = [
  {
    id: "summary",
    name: "요약",
    icon: IconFileText,
    description: "공정 검사의 요약 정보"
  },
  {
    id: "detailed",
    name: "상세", 
    icon: IconClipboardList,
    description: "공정 검사의 상세한 품질 검사 항목"
  }
]

// 공정라인 옵션
const PROCESS_LINE_OPTIONS = [
  { value: "select", label: "선택" },
  { value: "deposition1", label: "증착1" },
  { value: "deposition2", label: "증착2" },
  { value: "coating1", label: "1코팅" },
  { value: "coating2", label: "2코팅" },
  { value: "internal_coating", label: "내부코팅" }
]

// 세부 공정 라인 옵션
const DETAILED_PROCESS_OPTIONS = {
  deposition1: [
    { value: "select", label: "선택" },
    { value: "primer", label: "하도" },
    { value: "topcoat", label: "상도" }
  ],
  deposition2: [
    { value: "select", label: "선택" },
    { value: "primer", label: "하도" },
    { value: "topcoat", label: "상도" }
  ],
  coating2: [
    { value: "select", label: "선택" },
    { value: "primer", label: "하도" },
    { value: "topcoat", label: "상도" }
  ],
  internal_coating: [
    { value: "select", label: "선택" },
    { value: "machine1", label: "1호기" },
    { value: "machine2", label: "2호기" },
    { value: "machine3", label: "3호기" }
  ]
}

// 박리테스트 결과 옵션
const PEEL_TEST_OPTIONS = [
  { value: "select", label: "선택" },
  { value: "pass", label: "합격" },
  { value: "fail", label: "불합격" },
  { value: "conditional_pass", label: "조건부합격" }
]

// 라인 스핀들 비율 옵션
const SPINDLE_RATIO_OPTIONS = [
  { value: "select", label: "선택" },
  { value: "direct", label: "직접입력" },
  { value: "1:1", label: "1:1" },
  { value: "2:1", label: "2:1" },
  { value: "3:1", label: "3:1" },
  { value: "4:1", label: "4:1" },
  { value: "4:3", label: "4:3" },
  { value: "8:7", label: "8:7" }
]

export function ProcessInspectionForm({ orderInfos }: ProcessInspectionFormProps) {
  const [activeSection, setActiveSection] = useState("summary")
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  // 기본 설정값
  const defaultSummarySettings = {
    showPeelTestResult: false,
    showConditionalPassReason: false,
    showColorDifference: false,
    showInjectionPackaging: false,
    showCoatingPackaging: false,
    showUvCondition: false,
    showIrCondition: false,
    showLineSpeed: false,
    showSpindleRatio: false
  }

  const [summarySettings, setSummarySettings] = useState(() => {
    // 로컬 스토리지에서 설정 불러오기 (24시간 TTL)
    return getLocalStorageWithTTL('processInspectionSummarySettings', defaultSummarySettings)
  })
 
  const { user } = useAuth()
  
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    inspectionDate: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
    processLine: "select",
    detailedProcessLine: "select",
    peelTestResult: "select",
    conditionalPassReason: "",
    colorDifference: "",
    usedJig: "",
    injectionPackaging: "",
    coatingPackaging: "",
    firstInspectionCount: "",
    middleInspectionCount: "",
    finalInspectionCount: "",
    additionalWorkMethod: "",
    specialNotes: "",
    lineSpeed: "",
    spindleRatio: "select",
    customSpindleRatio: "",
    uvCondition: "",
    irCondition: "",
    primerPaint: "",
    topcoatPaint: "",
    photos: [] as File[]
  })

  // 총 불량 수량 상태
  const [totalDefectCount, setTotalDefectCount] = useState(0)

  // 사용자의 주 공정라인을 기본값으로 설정
  useEffect(() => {
    if (user?.mainProcessLine && user.mainProcessLine !== 'select') {
      updateFormData('processLine', user.mainProcessLine)
    }
  }, [user?.mainProcessLine])

  // 요약 설정이 변경될 때마다 로컬 스토리지에 저장 (24시간 TTL)
  useEffect(() => {
    setLocalStorageWithTTL('processInspectionSummarySettings', summarySettings, 24)
  }, [summarySettings])

  // 날짜 포맷팅 함수
  const formatDate = (date: string) => {
    return date.replace(/-/g, '.')
  }

  // 폼 데이터 업데이트 함수
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 총 검사수량 계산
  const totalInspectionCount = (parseInt(formData.firstInspectionCount) || 0) + (parseInt(formData.middleInspectionCount) || 0) + (parseInt(formData.finalInspectionCount) || 0)

  // 사진 업로드 핸들러
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      updateFormData('photos', [...formData.photos, ...files])
    }
  }

  // 사진 삭제 핸들러
  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index)
    updateFormData('photos', newPhotos)
  }

  return (
    <Card className="border-transparent shadow-none max-w-4xl mx-auto">
      <CardContent className="space-y-6 p-0 px-1 w-full">
        {/* 공정검사 섹션 토글 버튼 - 우측상단 */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2">
            <div className="flex border rounded-lg">
              {PROCESS_INSPECTION_SECTIONS.map((section) => {
                const IconComponent = section.icon
                return (
                  <Toggle
                    key={section.id}
                    pressed={activeSection === section.id}
                    onPressedChange={() => setActiveSection(section.id)}
                    className="flex items-center gap-2 px-3 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    <IconComponent className="h-4 w-4" />
                    {section.name}
                  </Toggle>
                )
              })}
            </div>
            <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <IconSettings className="h-4 w-4" />
                  설정
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>요약 모드 표시 설정</DialogTitle>
                  <DialogDescription>
                    요약 모드에서 표시할 항목들을 선택하세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>박리테스트결과</Label>
                      <p className="text-sm text-muted-foreground">
                        박리테스트 결과 및 조건부합격 사유
                      </p>
                    </div>
                    <Switch
                      checked={summarySettings.showPeelTestResult}
                      onCheckedChange={(checked) => 
                        setSummarySettings(prev => ({ ...prev, showPeelTestResult: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>색상 차이</Label>
                      <p className="text-sm text-muted-foreground">
                        견본과 색상 차이
                      </p>
                    </div>
                    <Switch
                      checked={summarySettings.showColorDifference}
                      onCheckedChange={(checked) => 
                        setSummarySettings(prev => ({ ...prev, showColorDifference: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>사출 포장 방식</Label>
                      <p className="text-sm text-muted-foreground">
                        사출 후 포장 방식
                      </p>
                    </div>
                    <Switch
                      checked={summarySettings.showInjectionPackaging}
                      onCheckedChange={(checked) => 
                        setSummarySettings(prev => ({ ...prev, showInjectionPackaging: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>증착/코팅 후 포장</Label>
                      <p className="text-sm text-muted-foreground">
                        증착/코팅 후 포장 방식
                      </p>
                    </div>
                    <Switch
                      checked={summarySettings.showCoatingPackaging}
                      onCheckedChange={(checked) => 
                        setSummarySettings(prev => ({ ...prev, showCoatingPackaging: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>UV 조건</Label>
                      <p className="text-sm text-muted-foreground">
                        UV 조건 정보
                      </p>
                    </div>
                    <Switch
                      checked={summarySettings.showUvCondition}
                      onCheckedChange={(checked) => 
                        setSummarySettings(prev => ({ ...prev, showUvCondition: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>IR 조건</Label>
                      <p className="text-sm text-muted-foreground">
                        IR 조건 정보
                      </p>
                    </div>
                    <Switch
                      checked={summarySettings.showIrCondition}
                      onCheckedChange={(checked) => 
                        setSummarySettings(prev => ({ ...prev, showIrCondition: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>라인 속도</Label>
                      <p className="text-sm text-muted-foreground">
                        라인 속도 정보
                      </p>
                    </div>
                    <Switch
                      checked={summarySettings.showLineSpeed}
                      onCheckedChange={(checked) => 
                        setSummarySettings(prev => ({ ...prev, showLineSpeed: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>라인 스핀들 비율</Label>
                      <p className="text-sm text-muted-foreground">
                        라인 스핀들 비율 정보
                      </p>
                    </div>
                    <Switch
                      checked={summarySettings.showSpindleRatio}
                      onCheckedChange={(checked) => 
                        setSummarySettings(prev => ({ ...prev, showSpindleRatio: checked }))
                      }
                    />
                  </div>

                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 요약/상세 콘텐츠 */}
        {activeSection === "summary" ? (
          <div className="space-y-4">
            <ProcessInspectionContent 
              formData={formData}
              updateFormData={updateFormData}
              totalInspectionCount={totalInspectionCount}
              totalDefectCount={totalDefectCount}
              isSummary={true}
              setTotalDefectCount={setTotalDefectCount}
              handlePhotoUpload={handlePhotoUpload}
              removePhoto={removePhoto}
              summarySettings={summarySettings}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <ProcessInspectionContent 
              formData={formData}
              updateFormData={updateFormData}
              totalInspectionCount={totalInspectionCount}
              totalDefectCount={totalDefectCount}
              isSummary={false}
              setTotalDefectCount={setTotalDefectCount}
              handlePhotoUpload={handlePhotoUpload}
              removePhoto={removePhoto}
              summarySettings={summarySettings}
            />
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline">임시저장</Button>
          <Button>검사 완료</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ProcessInspectionContent 컴포넌트 - 요약/상세 탭에서 공통으로 사용
interface ProcessInspectionContentProps {
  formData: any
  updateFormData: (field: string, value: any) => void
  totalInspectionCount: number
  totalDefectCount: number
  isSummary: boolean
  setTotalDefectCount: (count: number) => void
  handlePhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  removePhoto?: (index: number) => void
  summarySettings?: {
    showPeelTestResult: boolean
    showConditionalPassReason: boolean
    showColorDifference: boolean
    showInjectionPackaging: boolean
    showCoatingPackaging: boolean
    showUvCondition: boolean
    showIrCondition: boolean
    showLineSpeed: boolean
    showSpindleRatio: boolean
  }
}

function ProcessInspectionContent({
  formData,
  updateFormData,
  totalInspectionCount,
  totalDefectCount,
  isSummary,
  setTotalDefectCount,
  handlePhotoUpload,
  removePhoto,
  summarySettings
}: ProcessInspectionContentProps) {
  // 날짜 포맷팅 함수
  const formatDate = (date: string) => {
    return date.replace(/-/g, '.')
  }

  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <div className="space-y-4">
        {/* 모바일: 세로 배치 */}
        <div className="grid grid-cols-1 lg:hidden gap-4">
          <div className="space-y-2">
            <Label>검사일자</Label>
            <Input 
              value={formData.inspectionDate}
              onChange={(e) => updateFormData('inspectionDate', formatDate(e.target.value))}
              placeholder="2025.07.17"
              className="px-3"
            />
          </div>
          <div className="space-y-2">
            <Label>사용된 지그</Label>
            <Input 
              value={formData.usedJig}
              onChange={(e) => updateFormData('usedJig', e.target.value)}
              placeholder="사용된 지그를 입력하세요"
            />
          </div>
          <div className="flex flex-row gap-4">
            <div className="space-y-2 flex-1">
              <Label>공정라인선택</Label>
              <Select value={formData.processLine} onValueChange={(value) => updateFormData('processLine', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="공정라인 선택" />
                </SelectTrigger>
                <SelectContent>
                  {PROCESS_LINE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value === "select" ? (
                        option.label
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={
                              option.value === "deposition1" ? "bg-red-100 text-red-800 hover:bg-red-200" :
                              option.value === "deposition2" ? "bg-orange-100 text-orange-800 hover:bg-orange-200" :
                              option.value === "coating1" ? "bg-green-100 text-green-800 hover:bg-green-200" :
                              option.value === "coating2" ? "bg-purple-100 text-purple-800 hover:bg-purple-200" :
                              option.value === "internal_coating" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" :
                              "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }
                          >
                            {option.label}
                          </Badge>
                        </div>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* 세부 공정 라인 (조건부 표시) */}
            {(formData.processLine === "deposition1" || formData.processLine === "deposition2" || 
              formData.processLine === "coating2" || formData.processLine === "internal_coating") && (
              <div className="space-y-2 flex-1">
                <Label>세부 공정 라인</Label>
                <Select value={formData.detailedProcessLine} onValueChange={(value) => updateFormData('detailedProcessLine', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="세부 공정 라인 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {DETAILED_PROCESS_OPTIONS[formData.processLine as keyof typeof DETAILED_PROCESS_OPTIONS]?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* 태블릿/데스크탑: 4칸 grid 배치 */}
        <div className="hidden lg:grid grid-cols-4 gap-4">
          {/* 검사일자 */}
          <div className="space-y-2">
            <Label>검사일자</Label>
            <Input 
              value={formData.inspectionDate}
              onChange={(e) => updateFormData('inspectionDate', formatDate(e.target.value))}
              placeholder="2025.07.17"
              className="px-3"
            />
          </div>
          
          {/* 사용된 지그 */}
          <div className="space-y-2">
            <Label>사용된 지그</Label>
            <Input 
              value={formData.usedJig}
              onChange={(e) => updateFormData('usedJig', e.target.value)}
              placeholder="사용된 지그를 입력하세요"
            />
          </div>
          
          {/* 공정라인선택 - 세부공정라인이 없을 때 2칸 차지, 있을 때 1칸 차지 */}
          <div className={`space-y-2 ${(formData.processLine === "deposition1" || formData.processLine === "deposition2" || 
            formData.processLine === "coating2" || formData.processLine === "internal_coating") ? "col-span-1" : "col-span-2"}`}>
            <Label>공정라인선택</Label>
            <Select value={formData.processLine} onValueChange={(value) => updateFormData('processLine', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="공정라인 선택" />
              </SelectTrigger>
              <SelectContent>
                {PROCESS_LINE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.value === "select" ? (
                      option.label
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={
                            option.value === "deposition1" ? "bg-red-100 text-red-800 hover:bg-red-200" :
                            option.value === "deposition2" ? "bg-orange-100 text-orange-800 hover:bg-orange-200" :
                            option.value === "coating1" ? "bg-green-100 text-green-800 hover:bg-green-200" :
                            option.value === "coating2" ? "bg-purple-100 text-purple-800 hover:bg-purple-200" :
                            option.value === "internal_coating" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" :
                            "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }
                        >
                          {option.label}
                        </Badge>
                      </div>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 세부 공정 라인 (조건부 표시) - 1칸 차지 */}
          {(formData.processLine === "deposition1" || formData.processLine === "deposition2" || 
            formData.processLine === "coating2" || formData.processLine === "internal_coating") && (
            <div className="col-span-1 space-y-2">
              <Label>세부 공정 라인</Label>
              <Select value={formData.detailedProcessLine} onValueChange={(value) => updateFormData('detailedProcessLine', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="세부 공정 라인 선택" />
                </SelectTrigger>
                <SelectContent>
                  {DETAILED_PROCESS_OPTIONS[formData.processLine as keyof typeof DETAILED_PROCESS_OPTIONS]?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* 검사 결과 - 요약 탭에서는 설정에 따라 표시 */}
      {(!isSummary || (isSummary && (summarySettings?.showPeelTestResult || summarySettings?.showColorDifference))) && (
        <>
          <div className="space-y-4">
            <h4 className="text-md font-medium">검사 결과</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(!isSummary || (isSummary && summarySettings?.showPeelTestResult)) && (
                <div className="space-y-2">
                  <Label>박리테스트결과</Label>
                  <Select value={formData.peelTestResult} onValueChange={(value) => updateFormData('peelTestResult', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="박리테스트 결과 선택" />
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
              )}
              {(!isSummary || (isSummary && summarySettings?.showPeelTestResult)) && formData.peelTestResult === "conditional_pass" && (
                <div className="space-y-2">
                  <Label>조건부합격 사유</Label>
                  <Input 
                    value={formData.conditionalPassReason}
                    onChange={(e) => updateFormData('conditionalPassReason', e.target.value)}
                    placeholder="조건부합격 사유를 입력하세요"
                    className="px-3"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(!isSummary || (isSummary && summarySettings?.showColorDifference)) && (
                <div className="space-y-2">
                  <Label>견본과 색상 차이</Label>
                  <Input 
                    value={formData.colorDifference}
                    onChange={(e) => updateFormData('colorDifference', e.target.value)}
                    placeholder="색상 차이를 입력하세요"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}



      {/* 포장 방식 - 요약 탭에서는 설정에 따라 표시 */}
      {(!isSummary || (isSummary && (summarySettings?.showInjectionPackaging || summarySettings?.showCoatingPackaging))) && (
        <>
          <div className="space-y-4">
            <h4 className="text-md font-medium">포장 방식</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(!isSummary || (isSummary && summarySettings?.showInjectionPackaging)) && (
                <div className="space-y-2">
                  <Label>사출 포장 방식</Label>
                  <Input 
                    value={formData.injectionPackaging}
                    onChange={(e) => updateFormData('injectionPackaging', e.target.value)}
                    placeholder="사출 포장 방식을 입력하세요"
                  />
                </div>
              )}
              {(!isSummary || (isSummary && summarySettings?.showCoatingPackaging)) && (
                <div className="space-y-2">
                  <Label>증착/코팅 후 포장 방식</Label>
                  <Input 
                    value={formData.coatingPackaging}
                    onChange={(e) => updateFormData('coatingPackaging', e.target.value)}
                    placeholder="증착/코팅 후 포장 방식을 입력하세요"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 검사 회차 정보 */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>초물</Label>
            <Input 
              type="number"
              value={formData.firstInspectionCount}
              onChange={(e) => updateFormData('firstInspectionCount', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label>중물</Label>
            <Input 
              type="number"
              value={formData.middleInspectionCount}
              onChange={(e) => updateFormData('middleInspectionCount', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label>종물</Label>
            <Input 
              type="number"
              value={formData.finalInspectionCount}
              onChange={(e) => updateFormData('finalInspectionCount', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <div className="text-sm text-muted-foreground text-center">
          총 검사수량: {totalInspectionCount}개 | 총 불량횟수: {totalDefectCount}회
        </div>
      </div>

      {/* 불량 유형 및 추가 작업 */}
      <div className="space-y-4">
        <DefectTypeSelector 
          defectTypes={[
            { id: 1, name: "색상 불량", color: "bg-red-500" },
            { id: 2, name: "표면 불량", color: "bg-orange-500" },
            { id: 3, name: "크기 불량", color: "bg-yellow-500" },
            { id: 4, name: "박리 불량", color: "bg-purple-500" },
            { id: 5, name: "기타", color: "bg-gray-500" }
          ]}
          totalQty={totalInspectionCount}
          onTotalDefectChange={setTotalDefectCount}
        />
        <div className="space-y-2">
          <Label>추가 작업 방식</Label>
          <Textarea 
            value={formData.additionalWorkMethod}
            onChange={(e) => updateFormData('additionalWorkMethod', e.target.value)}
            placeholder="예: 알코올 마사지, 화염 처리 등"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>특이사항/조치사항</Label>
          <Textarea 
            value={formData.specialNotes}
            onChange={(e) => updateFormData('specialNotes', e.target.value)}
            placeholder="특이사항이나 조치사항을 입력하세요"
            rows={3}
          />
        </div>
      </div>

      {/* 라인 조건 - 요약 탭에서는 UV/IR 조건 숨김 */}
      <div className="space-y-4">
        <h4 className="text-md font-medium flex items-center gap-2">
          <IconSettings className="h-4 w-4" />
          라인 조건
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(!isSummary || (isSummary && summarySettings?.showLineSpeed)) && (
            <div className="space-y-2">
              <Label>라인 속도</Label>
              <Input 
                type="number"
                value={formData.lineSpeed}
                onChange={(e) => updateFormData('lineSpeed', e.target.value)}
                placeholder="라인 속도를 입력하세요"
              />
            </div>
          )}
          {(!isSummary || (isSummary && summarySettings?.showSpindleRatio)) && (
            <div className="space-y-2">
              <Label>라인 스핀들 비율</Label>
              <Select value={formData.spindleRatio} onValueChange={(value) => updateFormData('spindleRatio', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="스핀들 비율 선택" />
                </SelectTrigger>
                <SelectContent>
                  {SPINDLE_RATIO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {(!isSummary || (isSummary && summarySettings?.showSpindleRatio)) && formData.spindleRatio === "direct" && (
          <div className="space-y-2">
            <Label>직접입력 스핀들 비율</Label>
            <Input 
              value={formData.customSpindleRatio}
              onChange={(e) => updateFormData('customSpindleRatio', e.target.value)}
              placeholder="예: 5:3"
            />
          </div>
        )}
        {(!isSummary || (isSummary && (summarySettings?.showUvCondition || summarySettings?.showIrCondition))) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(!isSummary || (isSummary && summarySettings?.showUvCondition)) && (
                <div className="space-y-2">
                  <Label>UV 조건</Label>
                  <Input 
                    value={formData.uvCondition}
                    onChange={(e) => updateFormData('uvCondition', e.target.value)}
                    placeholder="UV 조건을 입력하세요"
                  />
                </div>
              )}
              {(!isSummary || (isSummary && summarySettings?.showIrCondition)) && (
                <div className="space-y-2">
                  <Label>IR 조건</Label>
                  <Input 
                    value={formData.irCondition}
                    onChange={(e) => updateFormData('irCondition', e.target.value)}
                    placeholder="IR 조건을 입력하세요"
                  />
                </div>
              )}
            </div>
        )}
      </div>

      {/* 사용도료 */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">사용도료</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>하도</Label>
            <Input 
              value={formData.primerPaint}
              onChange={(e) => updateFormData('primerPaint', e.target.value)}
              placeholder="하도 도료를 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label>상도</Label>
            <Input 
              value={formData.topcoatPaint}
              onChange={(e) => updateFormData('topcoatPaint', e.target.value)}
              placeholder="상도 도료를 입력하세요"
            />
          </div>
        </div>
      </div>

      {/* 사진 첨부 - 항상 표시 */}
      <div className="space-y-4">
        <h4 className="text-md font-medium flex items-center gap-2">
          <IconPhoto className="h-4 w-4" />
          사진 첨부
        </h4>
        {handlePhotoUpload && (
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
                onClick={() => document.getElementById('photo-upload-mobile-process')?.click()}
                className="flex items-center gap-2 w-full"
              >
                <IconPhoto className="h-4 w-4" />
                사진 첨부
              </Button>
              <Input 
                id="photo-upload-mobile-process"
                type="file" 
                multiple 
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
        )}
        {formData.photos.length > 0 && removePhoto && (
          <div className="space-y-2">
            <Label>업로드된 사진</Label>
            <div className="grid grid-cols-3 gap-2">
              {formData.photos.map((photo: File, index: number) => (
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
    </div>
  )
} 