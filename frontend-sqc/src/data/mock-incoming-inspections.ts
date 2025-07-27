import { IncomingInspection, IncomingInspectionDefect, InspectionDraftStatus } from "@/types/models"

export const mockIncomingInspections: IncomingInspection[] = [
  {
    id: 1,
    orderNumbers: ["ORD-2024-001", "ORD-2024-002"],
    client: "삼성전자",
    productName: "스마트폰 케이스",
    partName: "후면 커버",
    specification: "플라스틱, 블랙",
    manager: "김검사",
    inspectionDate: new Date("2024-02-15T09:00:00Z"),
    totalQty: 1000,
    defectQty: 25,
    notes: "일부 스크래치 발견, 허용 범위 내",
    status: InspectionDraftStatus.COMPLETED,
    defects: [],
    attachments: [],
    createdAt: new Date("2024-02-15T09:00:00Z"),
    updatedAt: new Date("2024-02-15T16:30:00Z")
  },
  {
    id: 2,
    orderNumbers: ["ORD-2024-003"],
    client: "LG전자",
    productName: "냉장고 부품",
    partName: "도어 핸들",
    specification: "스테인리스, 실버",
    manager: "이품질",
    inspectionDate: new Date("2024-02-20T10:30:00Z"),
    totalQty: 500,
    defectQty: 5,
    notes: "품질 양호",
    status: InspectionDraftStatus.COMPLETED,
    defects: [],
    attachments: [],
    createdAt: new Date("2024-02-20T10:30:00Z"),
    updatedAt: new Date("2024-02-20T15:45:00Z")
  },
  {
    id: 3,
    orderNumbers: ["ORD-2024-004"],
    client: "현대자동차",
    productName: "자동차 부품",
    partName: "범퍼 브래킷",
    specification: "알루미늄, 무도장",
    manager: "김검사",
    inspectionDate: new Date("2024-02-25T08:00:00Z"),
    totalQty: 2000,
    defectQty: 0,
    notes: "검사 진행 중",
    status: InspectionDraftStatus.DRAFT,
    defects: [],
    attachments: [],
    createdAt: new Date("2024-02-25T08:00:00Z"),
    updatedAt: new Date("2024-02-25T14:20:00Z")
  },
  {
    id: 4,
    orderNumbers: ["ORD-2024-005"],
    client: "SK하이닉스",
    productName: "반도체 장비",
    partName: "챔버 부품",
    specification: "특수강, 정밀가공",
    manager: "정검사",
    inspectionDate: new Date("2024-02-22T13:15:00Z"),
    totalQty: 100,
    defectQty: 2,
    notes: "치수 불량 2개 발견",
    status: InspectionDraftStatus.COMPLETED,
    defects: [],
    attachments: [],
    createdAt: new Date("2024-02-22T13:15:00Z"),
    updatedAt: new Date("2024-02-22T17:30:00Z")
  },
  {
    id: 5,
    orderNumbers: ["ORD-2024-006", "ORD-2024-007"],
    client: "포스코",
    productName: "철강 제품",
    partName: "H빔 연결재",
    specification: "SS400, 용접",
    manager: "이품질",
    inspectionDate: new Date("2024-02-24T07:45:00Z"),
    totalQty: 5000,
    defectQty: 150,
    notes: "용접 불량 다수 발견, 재작업 필요",
    status: InspectionDraftStatus.COMPLETED,
    defects: [],
    attachments: [],
    createdAt: new Date("2024-02-24T07:45:00Z"),
    updatedAt: new Date("2024-02-24T18:00:00Z")
  }
]

export const mockIncomingInspectionDefects: IncomingInspectionDefect[] = [
  {
    id: 1,
    inspection: mockIncomingInspections[0],
    inspectionId: 1,
    defectTypeId: 1, // 스크래치
    customType: undefined,
    count: 20,
    details: { location: "후면", severity: "경미" }
  },
  {
    id: 2,
    inspection: mockIncomingInspections[0],
    inspectionId: 1,
    defectTypeId: 2, // 변색
    customType: undefined,
    count: 5,
    details: { location: "모서리", severity: "보통" }
  },
  {
    id: 3,
    inspection: mockIncomingInspections[1],
    inspectionId: 2,
    defectTypeId: 4, // 버
    customType: undefined,
    count: 5,
    details: { location: "손잡이 부분", severity: "경미" }
  },
  {
    id: 4,
    inspection: mockIncomingInspections[3],
    inspectionId: 4,
    defectTypeId: 5, // 치수불량
    customType: undefined,
    count: 2,
    details: { measurement: "±0.05mm 초과", location: "구멍 직경" }
  },
  {
    id: 5,
    inspection: mockIncomingInspections[4],
    inspectionId: 5,
    defectTypeId: 7, // 용접불량
    customType: undefined,
    count: 150,
    details: { type: "기공", location: "용접부" }
  }
]