import { Button } from "@/components/ui/button"
import { Save, Download } from "lucide-react"

interface SettingsHeaderProps {
  onExport?: () => void
  onSave?: () => void
  isLoading?: boolean
}

export function SettingsHeader({ 
  onExport, 
  onSave, 
  isLoading = false 
}: SettingsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground">시스템 설정을 관리합니다.</p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onExport}
          disabled={isLoading}
        >
          <Download className="w-4 h-4 mr-2" />
          설정 내보내기
        </Button>
        <Button 
          size="sm"
          onClick={onSave}
          disabled={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "저장 중..." : "변경사항 저장"}
        </Button>
      </div>
    </div>
  )
}