import { IconHome, IconChartBar, IconReport, IconSettings, IconPlus } from "@tabler/icons-react"

interface SmartQCBottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onCenterButtonClick: () => void
}

export function SmartQCBottomNavigation({ 
  activeTab, 
  onTabChange, 
  onCenterButtonClick 
}: SmartQCBottomNavigationProps) {
  const navItems = [
    { id: "home", icon: IconHome, label: "홈" },
    { id: "analysis", icon: IconChartBar, label: "분석" },
    { id: "reports", icon: IconReport, label: "보고서" },
    { id: "settings", icon: IconSettings, label: "설정" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
              activeTab === item.id
                ? "text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <item.icon size={20} />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
        
        {/* 중앙 검사 작성 버튼 */}
        <button
          onClick={onCenterButtonClick}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <IconPlus size={20} />
          <span className="text-xs mt-1">검사 작성</span>
        </button>
      </div>
    </nav>
  )
} 