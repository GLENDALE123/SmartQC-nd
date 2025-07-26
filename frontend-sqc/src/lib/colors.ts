// 배지 색상 옵션 정의
export const COLOR_OPTIONS = [
  { name: "연한 녹색", value: "bg-green-400", hex: "#4ade80" },
  { name: "연한 파란색", value: "bg-blue-400", hex: "#60a5fa" },
  { name: "빨간색", value: "bg-red-500", hex: "#ef4444" },
  { name: "주황색", value: "bg-orange-500", hex: "#f97316" },
  { name: "노란색", value: "bg-yellow-500", hex: "#eab308" },
  { name: "초록색", value: "bg-green-500", hex: "#22c55e" },
  { name: "파란색", value: "bg-blue-500", hex: "#3b82f6" },
  { name: "보라색", value: "bg-purple-500", hex: "#a855f7" },
  { name: "분홍색", value: "bg-pink-500", hex: "#ec4899" },
  { name: "회색", value: "bg-gray-500", hex: "#6b7280" },
  { name: "검정색", value: "bg-black", hex: "#000000" },
  { name: "갈색", value: "bg-amber-700", hex: "#b45309" },
  { name: "청록색", value: "bg-cyan-500", hex: "#06b6d4" },
  { name: "라임색", value: "bg-lime-500", hex: "#84cc16" },
  { name: "인디고", value: "bg-indigo-500", hex: "#6366f1" },
  { name: "로즈색", value: "bg-rose-500", hex: "#f43f5e" },
  { name: "슬레이트", value: "bg-slate-500", hex: "#64748b" },
] as const

// 색상 값에서 HEX 색상 추출
export function getHexColor(colorValue: string): string {
  // 커스텀 색상 처리
  if (colorValue.startsWith('custom-')) {
    return colorValue.replace('custom-', '')
  }
  
  const colorOption = COLOR_OPTIONS.find(option => option.value === colorValue)
  return colorOption?.hex || "#ef4444" // 기본값: 빨간색
}

// HEX 색상에서 Tailwind 클래스 찾기
export function getTailwindClass(hexColor: string): string {
  const colorOption = COLOR_OPTIONS.find(option => option.hex === hexColor)
  return colorOption?.value || `custom-${hexColor}`
}

// 색상 이름에서 색상 옵션 찾기
export function getColorOptionByName(name: string) {
  return COLOR_OPTIONS.find(option => option.name === name)
}

// 색상 값에서 색상 옵션 찾기
export function getColorOptionByValue(value: string) {
  return COLOR_OPTIONS.find(option => option.value === value)
} 