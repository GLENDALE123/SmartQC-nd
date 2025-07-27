"use client"

import { IconPlus, IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

import { DefectTypeSelector } from "./DefectTypeSelector"

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

interface InspectionRoundSelectorProps {
  inspectionRounds: InspectionRound[]
  onInspectionRoundsChange: (rounds: InspectionRound[]) => void
}

export function InspectionRoundSelector({ 
  inspectionRounds, 
  onInspectionRoundsChange 
}: InspectionRoundSelectorProps) {

  // 검사 회차 추가
  const addInspectionRound = () => {
    const newRoundNumber = inspectionRounds.length + 1
    const newRound: InspectionRound = {
      id: Date.now().toString(),
      roundNumber: newRoundNumber,
      inspectionDate: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      inspectionQuantity: null,
      totalDefectiveQuantity: null,
      workerDefects: [{
        id: Date.now().toString(),
        workerName: "",
        inspectionQuantity: null,
        totalDefectCount: 0,
        defectTypes: []
      }]
    }
    onInspectionRoundsChange([...inspectionRounds, newRound])
  }

  // 검사 회차 삭제
  const removeInspectionRound = (roundId: string) => {
    const updatedRounds = inspectionRounds
      .filter(round => round.id !== roundId)
      .map((round, index) => ({
        ...round,
        roundNumber: index + 1
      }))
    onInspectionRoundsChange(updatedRounds)
  }

  // 작업자 추가
  const addWorker = (roundId: string) => {
    const updatedRounds = inspectionRounds.map(round => {
      if (round.id === roundId) {
        // 첫 번째 작업자의 검사수량을 가져옴
        const firstWorkerInspectionQuantity = round.workerDefects.length > 0 
          ? round.workerDefects[0].inspectionQuantity 
          : null;
        
        return {
          ...round,
          workerDefects: [
            ...round.workerDefects,
            {
              id: Date.now().toString(),
              workerName: "",
              inspectionQuantity: firstWorkerInspectionQuantity, // 첫 번째 작업자의 검사수량 복사
              totalDefectCount: 0,
              defectTypes: []
            }
          ]
        }
      }
      return round
    })
    onInspectionRoundsChange(updatedRounds)
  }

  // 작업자 삭제
  const removeWorker = (roundId: string, workerId: string) => {
    const updatedRounds = inspectionRounds.map(round => {
      if (round.id === roundId) {
        return {
          ...round,
          workerDefects: round.workerDefects.filter(worker => worker.id !== workerId)
        }
      }
      return round
    })
    onInspectionRoundsChange(updatedRounds)
  }

  // 작업자 업데이트
  const updateWorker = (roundId: string, workerId: string, field: string, value: any) => {
    const updatedRounds = inspectionRounds.map(round => {
      if (round.id === roundId) {
        return {
          ...round,
          workerDefects: round.workerDefects.map(worker => 
            worker.id === workerId ? { ...worker, [field]: value } : worker
          )
        }
      }
      return round
    })
    onInspectionRoundsChange(updatedRounds)
  }

  return (
    <div className="space-y-6 w-full">
      {inspectionRounds.map((round) => (
        <div key={round.id}>
          {/* 포장 작업자별 불량 입력 */}
          <Card>
            <div className="p-3 sm:p-4 flex items-center justify-between">
              <h4 className="text-md font-medium">{round.roundNumber}차검사</h4>
              {round.roundNumber > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInspectionRound(round.id)}
                  className="text-destructive hover:text-destructive h-8 w-8 p-0"
                >
                  <IconX className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="px-3 sm:px-4 pb-4 space-y-4 w-full">
              {round.workerDefects.map((worker) => (
                <div key={worker.id} className="flex items-start gap-4 p-3 sm:p-4 border rounded-lg bg-muted/30 relative">
                  {/* 삭제 버튼 - 카드 우측상단 */}
                  {round.workerDefects.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorker(round.id, worker.id)}
                      className="absolute top-2 right-2 text-destructive hover:text-destructive h-6 w-6 p-0"
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                      <div className="space-y-2 flex-1">
                        <Label>작업자명</Label>
                        <Input
                          value={worker.workerName}
                          onChange={(e) => updateWorker(round.id, worker.id, 'workerName', e.target.value)}
                          placeholder="작업자명"
                          className="w-full max-w-[120px] sm:max-w-[192px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>검사수량</Label>
                        <Input
                          type="number"
                          value={worker.inspectionQuantity || ""}
                          onChange={(e) => updateWorker(round.id, worker.id, 'inspectionQuantity', e.target.value === "" ? null : Number(e.target.value) || null)}
                          placeholder="0"
                          className="w-20 sm:w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    
                    <DefectTypeSelector 
                      defectTypes={[
                        { id: 1, name: "색상 불량", color: "bg-red-500" },
                        { id: 2, name: "표면 불량", color: "bg-orange-500" },
                        { id: 3, name: "크기 불량", color: "bg-yellow-500" },
                        { id: 4, name: "박리 불량", color: "bg-purple-500" },
                        { id: 5, name: "기타", color: "bg-gray-500" }
                      ]}
                      totalQty={worker.inspectionQuantity || 0}
                      onTotalDefectChange={(totalDefect) => {
                        updateWorker(round.id, worker.id, 'totalDefectCount', totalDefect)
                      }}
                    />
                    
                    {/* 총 불량횟수 표시 */}
                    <div className="text-sm text-muted-foreground">
                      총 불량횟수: {worker.totalDefectCount}회
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addWorker(round.id)}
                className="flex items-center gap-2"
              >
                <IconPlus className="h-4 w-4" />
                작업자 추가
              </Button>
            </div>
          </Card>


        </div>
      ))}

      {/* 검사 회차 추가 버튼 */}
      <Button
        variant="outline"
        onClick={addInspectionRound}
        className="flex items-center gap-2"
      >
        <IconPlus className="h-4 w-4" />
        검사 회차 추가
      </Button>
    </div>
  )
}