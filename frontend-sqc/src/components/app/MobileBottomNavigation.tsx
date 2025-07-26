"use client"

import { IconHome, IconChartBar, IconReport, IconSettings, IconPlus } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"

interface MobileBottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileBottomNavigation({ 
  activeTab, 
  onTabChange 
}: MobileBottomNavigationProps) {
  const navigate = useNavigate()
  
  const navItems = [
    { id: "home", icon: IconHome, label: "홈", path: "/" },
    { id: "analysis", icon: IconChartBar, label: "분석", path: "/quality-history" },
    { id: "reports", icon: IconReport, label: "보고서", path: "/reports" },
    { id: "settings", icon: IconSettings, label: "설정", path: "/settings" },
  ]

  const handleCenterButtonClick = () => {
    // 중앙 버튼 클릭 시 검사 작성 페이지로 이동
    navigate("/inspection/create/incoming")
  }

  const handleTabClick = (tabId: string, path: string) => {
    onTabChange(tabId)
    navigate(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id, item.path)}
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
          onClick={handleCenterButtonClick}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <IconPlus size={20} />
          <span className="text-xs mt-1">검사 작성</span>
        </button>
      </div>
    </nav>
  )
} 