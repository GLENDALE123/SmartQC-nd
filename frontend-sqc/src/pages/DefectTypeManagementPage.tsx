"use client"

import React, { useState } from "react"
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconBug,
  IconCheck,
  IconX
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getHexColor } from "@/lib/colors"
import { ColorPicker } from "@/components/ui/color-picker"

interface DefectType {
  id: number
  name: string
  description?: string
  color: string
  createdAt: Date
  updatedAt: Date
}

// 샘플 데이터 (실제로는 API에서 가져올 예정)
const SAMPLE_DEFECT_TYPES: DefectType[] = [
  { 
    id: 1, 
    name: "기름", 
    description: "기름 관련 불량", 
    color: "bg-green-400",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  { 
    id: 2, 
    name: "웰드", 
    description: "웰드 관련 불량", 
    color: "bg-green-400",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  { 
    id: 3, 
    name: "티", 
    description: "티 관련 불량", 
    color: "bg-blue-400",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  { 
    id: 4, 
    name: "흑점", 
    description: "흑점 관련 불량", 
    color: "bg-green-400",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
]

export function DefectTypeManagementPage() {
  const [defectTypes, setDefectTypes] = useState<DefectType[]>(SAMPLE_DEFECT_TYPES)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newDefectName, setNewDefectName] = useState("")
  const [newDefectColor, setNewDefectColor] = useState("bg-green-400")
  const [isAddingNew, setIsAddingNew] = useState(false)

  // 새 불량유형 추가
  const handleAddNewDefect = () => {
    if (!newDefectName.trim()) return

    const newDefect: DefectType = {
      id: Date.now(),
      name: newDefectName.trim(),
      description: undefined,
      color: newDefectColor,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setDefectTypes(prev => [...prev, newDefect])
    setNewDefectName("")
    setNewDefectColor("bg-green-400")
    setIsAddingNew(false)
  }

  // 불량유형 수정
  const handleEditDefect = (id: number, name: string, color: string) => {
    if (!name.trim()) return

    setDefectTypes(prev => prev.map(defectType =>
      defectType.id === id
        ? { ...defectType, name: name.trim(), color, updatedAt: new Date() }
        : defectType
    ))
    setEditingId(null)
  }

  // 불량유형 삭제
  const handleDeleteDefect = (id: number) => {
    if (confirm("정말로 이 불량유형을 삭제하시겠습니까?")) {
      setDefectTypes(prev => prev.filter(defectType => defectType.id !== id))
    }
  }

  // 새 불량유형 추가 시작
  const startAddingNew = () => {
    setIsAddingNew(true)
    setNewDefectName("")
    setNewDefectColor("bg-green-400")
  }

  // 새 불량유형 추가 취소
  const cancelAddingNew = () => {
    setIsAddingNew(false)
    setNewDefectName("")
    setNewDefectColor("bg-green-400")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <IconBug className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">표준 불량유형 관리</h1>
            <p className="text-muted-foreground">AI 분석에 사용될 표준 불량유형을 관리합니다. ({defectTypes.length}개 등록됨)</p>
          </div>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={startAddingNew}
          disabled={isAddingNew}
        >
          <IconPlus className="h-4 w-4" />
          새 불량유형 추가
        </Button>
      </div>

      {/* 새 불량유형 추가 행 */}
      {isAddingNew && (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-4">
            <Input
              value={newDefectName}
              onChange={(e) => setNewDefectName(e.target.value)}
              placeholder="불량유형명을 입력하세요"
              className="w-48"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddNewDefect()
                } else if (e.key === 'Escape') {
                  cancelAddingNew()
                }
              }}
              autoFocus
            />
            <ColorPicker
              value={newDefectColor}
              onChange={setNewDefectColor}
              size="sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleAddNewDefect}
              disabled={!newDefectName.trim()}
            >
              <IconCheck className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={cancelAddingNew}
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 불량유형 목록 */}
      <div className="space-y-0 border rounded-lg">
        {defectTypes.map((defectType, index) => (
          <div key={defectType.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            {editingId === defectType.id ? (
              // 편집 모드
              <div className="flex items-center justify-between flex-1">
                <div className="flex items-center gap-4">
                  <Input
                    value={newDefectName}
                    onChange={(e) => setNewDefectName(e.target.value)}
                    placeholder="불량유형명을 입력하세요"
                    className="w-48"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEditDefect(defectType.id, newDefectName, newDefectColor)
                      } else if (e.key === 'Escape') {
                        setEditingId(null)
                      }
                    }}
                    autoFocus
                  />
                  <ColorPicker
                    value={newDefectColor}
                    onChange={setNewDefectColor}
                    size="sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditDefect(defectType.id, newDefectName, newDefectColor)}
                    disabled={!newDefectName.trim()}
                  >
                    <IconCheck className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              // 표시 모드
              <>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="secondary"
                    className={cn(defectType.color, "text-white text-sm px-3 py-1")}
                    style={{ backgroundColor: getHexColor(defectType.color) }}
                  >
                    {defectType.name}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(defectType.id)
                      setNewDefectName(defectType.name)
                      setNewDefectColor(defectType.color)
                    }}
                    className="text-sm"
                  >
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDefect(defectType.id)}
                    className="text-destructive hover:text-destructive text-sm"
                  >
                    삭제
                  </Button>
                </div>
              </>
            )}
            {index < defectTypes.length - 1 && (
              <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 