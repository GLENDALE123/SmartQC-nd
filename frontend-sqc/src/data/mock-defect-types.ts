import { DefectType } from "@/types/models"

export const mockDefectTypes: DefectType[] = [
  {
    id: 1,
    name: "스크래치",
    description: "표면에 생긴 긁힘이나 흠집",
    color: "#ef4444", // red-500
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z")
  },
  {
    id: 2,
    name: "변색",
    description: "원래 색상과 다른 색으로 변한 상태",
    color: "#f97316", // orange-500
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z")
  },
  {
    id: 3,
    name: "크랙",
    description: "재료에 생긴 균열이나 갈라짐",
    color: "#dc2626", // red-600
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z")
  },
  {
    id: 4,
    name: "버",
    description: "가공 시 생긴 날카로운 돌출부",
    color: "#eab308", // yellow-500
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z")
  },
  {
    id: 5,
    name: "치수불량",
    description: "규격에서 벗어난 크기나 치수",
    color: "#8b5cf6", // violet-500
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z")
  },
  {
    id: 6,
    name: "도장불량",
    description: "도장 상태가 불량한 경우",
    color: "#06b6d4", // cyan-500
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z")
  },
  {
    id: 7,
    name: "용접불량",
    description: "용접 부위의 결함",
    color: "#84cc16", // lime-500
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z")
  },
  {
    id: 8,
    name: "표면거칠기",
    description: "표면이 거칠거나 매끄럽지 않은 상태",
    color: "#f59e0b", // amber-500
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z")
  },
  {
    id: 9,
    name: "이물질",
    description: "제품에 붙어있는 불필요한 물질",
    color: "#10b981", // emerald-500
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z")
  },
  {
    id: 10,
    name: "변형",
    description: "원래 형태에서 변형된 상태",
    color: "#6366f1", // indigo-500
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z")
  }
]