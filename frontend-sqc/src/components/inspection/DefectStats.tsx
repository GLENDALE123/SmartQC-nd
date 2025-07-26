"use client"

interface DefectItem {
  id: string
  count: number
}

interface DefectStatsProps {
  defects: DefectItem[]
  totalQty: number
}

export function DefectStats({ defects, totalQty }: DefectStatsProps) {
  if (defects.length === 0) {
    return null
  }

  const totalDefectQty = defects.reduce((sum, defect) => sum + defect.count, 0)
  const defectRate = totalQty > 0 ? ((totalDefectQty / totalQty) * 100).toFixed(1) : "0.0"

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <span>총 불량: {totalDefectQty}개</span>
      {totalQty > 0 && (
        <span>불량률: {defectRate}%</span>
      )}
    </div>
  )
} 