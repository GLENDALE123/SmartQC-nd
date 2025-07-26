"use client"

import { useState, useCallback } from "react"
import { IconSearch, IconFilter, IconX } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 최근 검사 기록 타입 정의
interface RecentInspection {
  id: string;
  type: string;
  title: string;
  date: string;
  status: string;
  inspector: string;
  orderNumber?: string;
  productName?: string;
  partName?: string;
}

interface RecentInspectionsPanelProps {
  recentInspections: RecentInspection[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function RecentInspectionsPanel({ 
  recentInspections, 
  searchQuery, 
  onSearchChange 
}: RecentInspectionsPanelProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    inspectionType: 'all',
    status: 'all',
    inspector: 'all'
  })

  // 검색 및 필터링 (안전한 배열 처리)
  const filteredInspections = Array.isArray(recentInspections) 
    ? recentInspections.filter(inspection => {
        // 검색어 필터링
        const searchMatch = 
          inspection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inspection.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inspection.inspector.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (inspection.orderNumber && inspection.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (inspection.productName && inspection.productName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (inspection.partName && inspection.partName.toLowerCase().includes(searchQuery.toLowerCase()))
        
        // 필터 조건들
        const typeMatch = filters.inspectionType === 'all' || inspection.type === filters.inspectionType
        const statusMatch = filters.status === 'all' || inspection.status === filters.status
        const inspectorMatch = filters.inspector === 'all' || inspection.inspector === filters.inspector
        
        return searchMatch && typeMatch && statusMatch && inspectorMatch
      })
    : []

  // 필터 초기화
  const clearFilters = useCallback(() => {
    setFilters({
      inspectionType: 'all',
      status: 'all',
      inspector: 'all'
    })
  }, [])

  // 필터 적용
  const applyFilters = useCallback(() => {
    // 필터가 적용된 상태에서 검색 결과 업데이트
    // 실제로는 여기서 API 호출을 할 수 있음
  }, [])

  return (
    <div className="h-full p-4">
      <div className="space-y-4">
        {/* 제목과 검색 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">최근 검사 참고</h3>
              <p className="text-sm text-muted-foreground">최근 작성된 검사 내용을 참고하세요</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <IconFilter className="h-4 w-4" />
              필터
            </Button>
          </div>
          
          {/* 검색 */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="검사 제목, 검사자, 유형으로 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 필터 UI */}
          {showFilters && (
            <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">필터 설정</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2 text-xs"
                >
                  초기화
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {/* 검사 타입 필터 */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">검사 타입</label>
                  <Select
                    value={filters.inspectionType}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, inspectionType: value }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="수입검사">수입검사</SelectItem>
                      <SelectItem value="공정검사">공정검사</SelectItem>
                      <SelectItem value="출하검사">출하검사</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 상태 필터 */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">상태</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="완료">완료</SelectItem>
                      <SelectItem value="진행중">진행중</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 검사자 필터 */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">검사자</label>
                  <Select
                    value={filters.inspector}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, inspector: value }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="김검사">김검사</SelectItem>
                      <SelectItem value="이검사">이검사</SelectItem>
                      <SelectItem value="박검사">박검사</SelectItem>
                      <SelectItem value="최검사">최검사</SelectItem>
                      <SelectItem value="정검사">정검사</SelectItem>
                      <SelectItem value="한검사">한검사</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 필터 적용 버튼 */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={applyFilters}
                  className="flex-1 h-8 text-xs"
                >
                  필터 적용
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="h-8 px-3 text-xs"
                >
                  <IconX className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 검사 목록 */}
        <div className="space-y-3">
          {filteredInspections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? '검색 결과가 없습니다.' : '최근 검사 기록이 없습니다.'}
            </div>
          ) : (
            filteredInspections.map((inspection) => (
              <div key={inspection.id} className="p-4 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {inspection.type}
                    </Badge>
                    <Badge 
                      variant={inspection.status === "완료" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {inspection.status}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm line-clamp-2">
                    {inspection.title}
                  </h4>
                  {(inspection.orderNumber || inspection.productName || inspection.partName) && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {inspection.orderNumber && <div>발주번호: {inspection.orderNumber}</div>}
                      {inspection.productName && <div>제품명: {inspection.productName}</div>}
                      {inspection.partName && <div>부속명: {inspection.partName}</div>}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{inspection.date}</span>
                    <span>검사자: {inspection.inspector}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 