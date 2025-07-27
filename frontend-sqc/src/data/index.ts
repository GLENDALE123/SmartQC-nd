// Mock 데이터 통합 export
export * from './mock-orders'
export * from './mock-users'
export * from './mock-defect-types'
export * from './mock-incoming-inspections'

// 테이블별 Mock 데이터 맵
import { allMockOrders } from './mock-orders'
import { mockUsers } from './mock-users'
import { mockDefectTypes } from './mock-defect-types'
import { mockIncomingInspections } from './mock-incoming-inspections'
import { TableKey, TableDataMap } from '@/types/models'

export const mockDataMap: Record<TableKey, any[]> = {
  order: allMockOrders,
  user: mockUsers,
  defectType: mockDefectTypes,
  incomingInspection: mockIncomingInspections,
  processInspection: [], // 추후 구현
  shipmentInspection: [], // 추후 구현
  uploadLog: [] // 추후 구현
}

// Mock API 서비스 함수들
export const mockApiService = {
  // 테이블 데이터 가져오기
  getTableData: async <T extends TableKey>(
    tableKey: T,
    options?: {
      page?: number
      pageSize?: number
      search?: string
      filters?: Record<string, any>
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }
  ): Promise<{
    data: TableDataMap[T][]
    total: number
    page: number
    pageSize: number
  }> => {
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let data = [...(mockDataMap[tableKey] as TableDataMap[T][])]
    
    // 검색 필터링
    if (options?.search) {
      const searchTerm = options.search.toLowerCase()
      data = data.filter(item => 
        Object.values(item).some(value => 
          value?.toString().toLowerCase().includes(searchTerm)
        )
      )
    }
    
    // 추가 필터링
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value && value.length > 0) {
          data = data.filter(item => {
            const itemValue = (item as any)[key]
            return Array.isArray(value) 
              ? value.includes(itemValue)
              : itemValue === value
          })
        }
      })
    }
    
    // 정렬
    if (options?.sortBy) {
      data.sort((a, b) => {
        const aValue = (a as any)[options.sortBy!]
        const bValue = (b as any)[options.sortBy!]
        
        if (aValue < bValue) return options.sortOrder === 'desc' ? 1 : -1
        if (aValue > bValue) return options.sortOrder === 'desc' ? -1 : 1
        return 0
      })
    }
    
    const total = data.length
    const page = options?.page || 1
    const pageSize = options?.pageSize || 10
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return {
      data: data.slice(startIndex, endIndex),
      total,
      page,
      pageSize
    }
  },
  
  // 특정 레코드 가져오기
  getRecord: async <T extends TableKey>(
    tableKey: T,
    id: number
  ): Promise<TableDataMap[T] | null> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const data = mockDataMap[tableKey] as TableDataMap[T][]
    return data.find(item => (item as any).id === id) || null
  },
  
  // 레코드 생성
  createRecord: async <T extends TableKey>(
    tableKey: T,
    record: Omit<TableDataMap[T], 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TableDataMap[T]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const data = mockDataMap[tableKey] as TableDataMap[T][]
    const newId = Math.max(...data.map(item => (item as any).id)) + 1
    const now = new Date()
    
    const newRecord = {
      ...record,
      id: newId,
      createdAt: now,
      updatedAt: now
    } as TableDataMap[T]
    
    data.push(newRecord)
    return newRecord
  },
  
  // 레코드 업데이트
  updateRecord: async <T extends TableKey>(
    tableKey: T,
    id: number,
    updates: Partial<TableDataMap[T]>
  ): Promise<TableDataMap[T] | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const data = mockDataMap[tableKey] as TableDataMap[T][]
    const index = data.findIndex(item => (item as any).id === id)
    
    if (index === -1) return null
    
    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: new Date()
    } as TableDataMap[T]
    
    return data[index]
  },
  
  // 레코드 삭제
  deleteRecord: async <T extends TableKey>(
    tableKey: T,
    id: number
  ): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const data = mockDataMap[tableKey] as TableDataMap[T][]
    const index = data.findIndex(item => (item as any).id === id)
    
    if (index === -1) return false
    
    data.splice(index, 1)
    return true
  }
}