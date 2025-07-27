"use client"

import { IconPhoto, IconFileText } from '@tabler/icons-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface DefectType {
  name: string
  count: number
  details: string
}

interface InspectionDetail {
  id: string
  type: 'incoming' | 'process' | 'shipment'
  inspectionDate: string
  inspector: string
  totalQuantity: number
  defectQuantity: number
  defectRate: number
  defectTypes: DefectType[]
  notes: string
  photos: string[]
}

interface InspectionDetailAccordionProps {
  inspection: InspectionDetail
}

export function InspectionDetailAccordion({ inspection }: InspectionDetailAccordionProps) {
  const getInspectionTypeLabel = (type: string) => {
    switch (type) {
      case 'incoming': return '수입검사'
      case 'process': return '공정검사'
      case 'shipment': return '출하검사'
      default: return type
    }
  }

  const getInspectionTypeColor = (type: string) => {
    switch (type) {
      case 'incoming': return 'bg-blue-500'
      case 'process': return 'bg-green-500'
      case 'shipment': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="inspection-detail">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <Badge className={getInspectionTypeColor(inspection.type)}>
              {getInspectionTypeLabel(inspection.type)}
            </Badge>
            <div className="flex-1 text-left">
              <div className="font-medium">
                {inspection.inspectionDate} - {inspection.inspector}
              </div>
              <div className="text-sm text-muted-foreground">
                검사수량: {inspection.totalQuantity}개 | 
                불량수량: {inspection.defectQuantity}개 | 
                불량률: {inspection.defectRate}%
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Card className="mt-2">
            <CardContent className="p-4 space-y-4">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">검사일자</div>
                  <div>{inspection.inspectionDate}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">검사자</div>
                  <div>{inspection.inspector}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">검사수량</div>
                  <div>{inspection.totalQuantity.toLocaleString()}개</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">불량률</div>
                  <div className="font-medium text-red-600">{inspection.defectRate}%</div>
                </div>
              </div>

              <Separator />

              {/* 불량유형 상세 */}
              {inspection.defectTypes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <IconFileText className="h-4 w-4" />
                    불량유형 상세
                  </h4>
                  <div className="space-y-2">
                    {inspection.defectTypes.map((defect, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{defect.name}</div>
                          <Badge variant="secondary">{defect.count}개</Badge>
                        </div>
                        {defect.details && (
                          <div className="text-sm text-muted-foreground">
                            {defect.details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 특이사항 */}
              {inspection.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">특이사항</h4>
                    <div className="p-3 border rounded-lg bg-muted/30 text-sm">
                      {inspection.notes}
                    </div>
                  </div>
                </>
              )}

              {/* 사진 첨부 */}
              {inspection.photos.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <IconPhoto className="h-4 w-4" />
                      사진 첨부 ({inspection.photos.length}개)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {inspection.photos.map((photo, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={photo}
                            alt={`사진 ${index + 1}`}
                            className="w-full h-full object-cover rounded border"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}