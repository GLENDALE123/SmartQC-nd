"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { IconFileText, IconClipboardList, IconTruck } from "@tabler/icons-react"
import { useAuth } from "@/hooks/useAuth"
// import { inspectionApi } from "@/api/inspection" // API 연동 시 사용
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

// 새로 만든 컴포넌트들 import
import { BasicInfoForm } from "@/components/inspection/BasicInfoForm"
import { IncomingInspectionForm } from "@/components/inspection/IncomingInspectionForm"
import { ProcessInspectionForm } from "@/components/inspection/ProcessInspectionForm"
import { ShipmentInspectionForm } from "@/components/inspection/ShipmentInspectionForm"
import { RecentInspectionsPanel } from "@/components/inspection/RecentInspectionsPanel"; 

// 검사 유형 정의
const INSPECTION_TYPES = [
  {
    id: "incoming",
    name: "수입검사",
    icon: IconFileText,
    description: "외부에서 들어오는 자재나 제품의 품질 검사",
    path: "/inspection/create/incoming"
  },
  {
    id: "process",
    name: "공정검사", 
    icon: IconClipboardList,
    description: "제조 공정 중간 단계의 품질 검사",
    path: "/inspection/create/process"
  },
  {
    id: "shipment",
    name: "출하검사",
    icon: IconTruck,
    description: "출하 전 최종 제품의 품질 검사",
    path: "/inspection/create/shipment"
  }
]

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

// 목업 데이터
const MOCK_RECENT_INSPECTIONS: RecentInspection[] = [
  {
    id: "1",
    type: "수입검사",
    title: "A사 자재 수입검사 #2024-001",
    date: "2024-01-15",
    status: "완료",
    inspector: "김검사",
    orderNumber: "PO-2024-001",
    productName: "LED 모듈",
    partName: "PCB 보드"
  },
  {
    id: "2", 
    type: "공정검사",
    title: "B라인 공정검사 #2024-002",
    date: "2024-01-14",
    status: "진행중",
    inspector: "이검사",
    orderNumber: "PO-2024-002",
    productName: "LED 모듈",
    partName: "하우징"
  },
  {
    id: "3",
    type: "출하검사", 
    title: "C제품 출하검사 #2024-003",
    date: "2024-01-13",
    status: "완료",
    inspector: "박검사",
    orderNumber: "PO-2024-003",
    productName: "LED 조명",
    partName: "완제품"
  },
  {
    id: "4",
    type: "수입검사",
    title: "D사 자재 수입검사 #2024-004",
    date: "2024-01-12",
    status: "완료",
    inspector: "최검사",
    orderNumber: "PO-2024-004",
    productName: "LED 모듈",
    partName: "PCB 보드"
  },
  {
    id: "5",
    type: "공정검사",
    title: "E라인 공정검사 #2024-005",
    date: "2024-01-11",
    status: "진행중",
    inspector: "정검사",
    orderNumber: "PO-2024-005",
    productName: "LED 조명",
    partName: "하우징"
  },
  {
    id: "6",
    type: "출하검사",
    title: "F제품 출하검사 #2024-006",
    date: "2024-01-10",
    status: "완료",
    inspector: "한검사",
    orderNumber: "PO-2024-006",
    productName: "LED 모듈",
    partName: "완제품"
  }
]

interface OrderInfo {
  orderNumber: string
  client: string
  productName: string
  partName: string
  specification: string
  manager: string
}

interface InspectionCreatePageProps {
  type: "incoming" | "process" | "shipment"
}

export function InspectionCreatePage({ type }: InspectionCreatePageProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [orderInfos, setOrderInfos] = useState<OrderInfo[]>([])
  const [hasInitialized, setHasInitialized] = useState(false)
  const [recentInspections, setRecentInspections] = useState<RecentInspection[]>(MOCK_RECENT_INSPECTIONS)
  // const [isLoadingInspections, setIsLoadingInspections] = useState(false) // API 연동 시 사용

  // 사용자의 검사 타입에 따른 기본 탭 결정
  const getDefaultInspectionType = () => {
    if (!user?.inspectionType) {
      return 'incoming' // 기본값
    }
    
    switch (user.inspectionType) {
      case 'incoming': return 'incoming'
      case 'process': return 'process'
      case 'shipment': return 'shipment'
      case 'all': return 'incoming' // 전체인 경우 기본값
      default: return 'incoming'
    }
  }

  // 현재 활성 탭 결정 (props type 사용)
  const activeTab = type

  // 페이지 최초 로드 시에만 사용자의 검사 타입에 따라 자동 리다이렉트
  useEffect(() => {
    if (!hasInitialized && user?.inspectionType) {
      const defaultType = getDefaultInspectionType()
      if (defaultType !== type) {
        const targetType = INSPECTION_TYPES.find(t => t.id === defaultType)
        if (targetType) {
          navigate(targetType.path, { replace: true })
        }
      }
      setHasInitialized(true)
    }
  }, [user?.inspectionType, type, navigate, hasInitialized])

  // 페이지 로드 시 초기 최근 검사 기록 로드 (목업 데이터 사용)
  useEffect(() => {
    // 목업 데이터를 사용하므로 API 호출하지 않음
    // 실제 API 연동 시에는 아래 주석을 해제
    // loadRecentInspections({ inspectionType: type })
    
    // 목업 데이터에서 현재 검사 타입에 맞는 데이터만 필터링
    const filteredMockData = MOCK_RECENT_INSPECTIONS.filter(inspection => {
      switch (type) {
        case 'incoming':
          return inspection.type === '수입검사'
        case 'process':
          return inspection.type === '공정검사'
        case 'shipment':
          return inspection.type === '출하검사'
        default:
          return true
      }
    })
    setRecentInspections(filteredMockData)
  }, [type])

  // 탭 변경 핸들러
  const handleTabChange = useCallback((newTab: string) => {
    const targetType = INSPECTION_TYPES.find(t => t.id === newTab)
    if (targetType) {
      navigate(targetType.path)
    }
  }, [navigate])

  // 최근 검사 기록 로드 (API 연동 시 사용)
  // const loadRecentInspections = async (filters?: {
  //   orderNumber?: string;
  //   productName?: string;
  //   partName?: string;
  //   inspectionType?: 'incoming' | 'process' | 'shipment';
  // }) => {
  //   try {
  //     setIsLoadingInspections(true)
  //     const data = await inspectionApi.getRecentInspections({
  //       ...filters,
  //       limit: 10
  //     })
  //     
  //     // API 응답이 배열인지 확인하고 안전하게 설정
  //     if (Array.isArray(data)) {
  //       setRecentInspections(data)
  //     } else if (data && Array.isArray(data.data)) {
  //       // 응답이 { data: [...] } 형태인 경우
  //       setRecentInspections(data.data)
  //     } else {
  //       console.warn('API 응답이 예상과 다릅니다:', data)
  //       setRecentInspections([])
  //     }
  //   } catch (error) {
  //     console.error('최근 검사 기록 로드 실패:', error)
  //     setRecentInspections([])
  //   } finally {
  //     setIsLoadingInspections(false)
  //   }
  // }

  // 기본정보 변경 핸들러
  const handleBasicInfoChange = useCallback((data: {
    orderNumbers: string[]
    orderInfos: OrderInfo[]
  }) => {
    setOrderInfos(data.orderInfos)
    
    // 발주 정보가 변경되면 해당 정보로 최근 검사 기록 필터링 (목업 데이터 사용)
    if (data.orderInfos.length > 0) {
      const firstOrder = data.orderInfos[0]
      // 목업 데이터에서 발주 정보와 검사 타입에 맞는 데이터 필터링
      const filteredMockData = MOCK_RECENT_INSPECTIONS.filter(inspection => {
        const typeMatch = (() => {
          switch (type) {
            case 'incoming': return inspection.type === '수입검사'
            case 'process': return inspection.type === '공정검사'
            case 'shipment': return inspection.type === '출하검사'
            default: return true
          }
        })()
        
        const orderMatch = inspection.orderNumber === firstOrder.orderNumber ||
                          inspection.productName === firstOrder.productName ||
                          inspection.partName === firstOrder.partName
        
        return typeMatch && orderMatch
      })
      setRecentInspections(filteredMockData)
    } else {
      // 발주 정보가 없으면 현재 검사 타입으로만 필터링
      const filteredMockData = MOCK_RECENT_INSPECTIONS.filter(inspection => {
        switch (type) {
          case 'incoming': return inspection.type === '수입검사'
          case 'process': return inspection.type === '공정검사'
          case 'shipment': return inspection.type === '출하검사'
          default: return true
        }
      })
      setRecentInspections(filteredMockData)
    }
  }, [type])

  // 검색 핸들러
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  return (
    <div className="h-screen flex flex-col">

      {/* 메인 콘텐츠 영역 - Resizable */}
      <div className="flex-1 px-3 sm:px-6 pb-6 pt-4" >
        {/* 검사 유형 Tabs */}
        <div className="mb-4 flex justify-center">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-6xl">
            <TabsList className="grid w-full grid-cols-3">
              {INSPECTION_TYPES.map((inspectionType) => {
                const IconComponent = inspectionType.icon
                return (
                  <TabsTrigger key={inspectionType.id} value={inspectionType.id} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {inspectionType.name}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg bg-background/50">
          {/* 왼쪽 영역 - 검사 작성폼 */}
          <ResizablePanel defaultSize={60} minSize={40} className="lg:defaultSize-60 lg:minSize-40">
            <div className="h-full p-0 sm:p-4 overflow-y-auto">
              <div className="space-y-6">
                {/* 첫 번째 컴포넌트: 발주/제품 기본정보 */}
                <BasicInfoForm onBasicInfoChange={handleBasicInfoChange} />
                
                {/* 두 번째 컴포넌트: 검사 유형별 작성폼 */}
                {activeTab === "incoming" && (
                  <IncomingInspectionForm orderInfos={orderInfos} />
                )}
                {activeTab === "process" && (
                  <ProcessInspectionForm orderInfos={orderInfos} />
                )}
                {activeTab === "shipment" && (
                  <ShipmentInspectionForm />
                )}
              </div>
            </div>
          </ResizablePanel>

          {/* ResizableHandle - 데스크톱에서만 표시 */}
          <ResizableHandle className="hidden lg:block" />

          {/* 오른쪽 영역 - 최근 검사 참고 (데스크톱에서만 표시) */}
          <ResizablePanel defaultSize={40} minSize={30} className="hidden lg:block">
            <RecentInspectionsPanel
              recentInspections={recentInspections}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
} 