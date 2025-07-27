import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { VerticalTabs } from "@/components/ui/vertical-tabs"
import { SettingsHeader } from "@/components/settings/SettingsHeader"
import { createSettingsTabs } from "@/components/settings/SettingsTabs"
import { toast } from "sonner"

export default function Settings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)

  const isAdmin = user?.role === "admin"
  const tabs = createSettingsTabs(isAdmin)

  const handleExport = async () => {
    setIsLoading(true)
    try {
      // 설정 내보내기 로직 구현
      await new Promise(resolve => setTimeout(resolve, 1000)) // 임시 지연
      toast.success("설정이 성공적으로 내보내졌습니다.")
    } catch (error) {
      toast.error("설정 내보내기에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // 설정 저장 로직 구현
      await new Promise(resolve => setTimeout(resolve, 1000)) // 임시 지연
      toast.success("설정이 성공적으로 저장되었습니다.")
    } catch (error) {
      toast.error("설정 저장에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <SettingsHeader 
        onExport={handleExport}
        onSave={handleSave}
        isLoading={isLoading}
      />
      
      <div className="mt-8">
        <VerticalTabs
          tabs={tabs}
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="gap-8"
          tabsListClassName="min-w-[220px]"
          tabsContentClassName=""
        />
      </div>
    </div>
  )
}