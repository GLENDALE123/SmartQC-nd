import { User, Bell, Bug, Upload } from "lucide-react"
import type { VerticalTabItem } from "@/components/ui/vertical-tabs"
import { useIsMobile } from "@/hooks/use-mobile"

// Import settings components
import ProfileSettings from "@/components/settings/ProfileSettings"
import NotificationSettings from "@/components/settings/NotificationSettings"
import DefectTypesSettings from "@/components/settings/DefectTypesSettings"
import ExcelImportSettings from "@/components/settings/excelimportsettings/ExcelImportMobile"

export type SettingsTabId = 'profile' | 'notifications' | 'defect-types' | 'excel-import'

export function createSettingsTabs(isAdmin: boolean): VerticalTabItem[] {
  const isMobile = useIsMobile()
  
  const baseTabs: VerticalTabItem[] = [
    {
      id: 'profile',
      label: '프로필',
      icon: User,
      content: <ProfileSettings />
    },
    {
      id: 'notifications',
      label: '알림 설정',
      icon: Bell,
      content: <NotificationSettings />
    }
  ]

  // 관리자 전용 탭 추가 (모바일에서만 표시, 데스크톱에서는 별도 관리자 메뉴로 이동)
  if (isAdmin && isMobile) {
    baseTabs.push(
      {
        id: 'defect-types',
        label: '불량 유형 관리',
        icon: Bug,
        content: <DefectTypesSettings />
      },
      {
        id: 'excel-import',
        label: '엑셀 가져오기',
        icon: Upload,
        content: <ExcelImportSettings />
      }
    )
  }

  return baseTabs
}

// 탭 정보만 필요한 경우를 위한 유틸리티
export function getSettingsTabInfo(isAdmin: boolean) {
  const isMobile = useIsMobile()
  
  return [
    { id: 'profile', label: '프로필', icon: User },
    { id: 'notifications', label: '알림 설정', icon: Bell },
    // 모바일에서만 관리자 탭 표시
    ...(isAdmin && isMobile ? [
      { id: 'defect-types', label: '불량 유형 관리', icon: Bug },
      { id: 'excel-import', label: '엑셀 가져오기', icon: Upload }
    ] : [])
  ]
}