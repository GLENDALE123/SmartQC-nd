"use client"

import * as React from "react"
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  IconDashboard,
  IconChartBar,
  IconReport,
  IconSettings,
  IconFileSpreadsheet,
  IconBug,
  IconMenu2,
} from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavAdmin } from "./nav-admin"
import { NavUser } from "./nav-user"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isMobile = useIsMobile()

  // 현재 경로에 따라 메뉴 활성 상태 결정
  const getMenuData = () => {
    const currentPath = location.pathname
    
    // 직급 텍스트 변환 함수
    const getRankText = (rank?: string) => {
      if (!rank || rank === 'select') return ''
      switch (rank) {
        case 'employee': return '사원'
        case 'team_leader': return '조장'
        case 'chief': return '주임'
        case 'assistant_manager': return '대리'
        case 'deputy_manager': return '부직장'
        case 'manager': return '과장'
        case 'director': return '직장'
        case 'head_of_division': return '본부장'
        case 'executive': return '상무'
        default: return rank
      }
    }

    // 직책 텍스트 변환 함수
    const getPositionText = (position?: string) => {
      if (!position || position === 'select') return ''
      switch (position) {
        case 'team_leader': return '분임조'
        case 'line_manager': return '라인관리자'
        case 'head_of_division': return '본부장'
        case 'factory_manager': return '공장장'
        default: return position
      }
    }

    // 공정라인 배지 컴포넌트 생성 함수
    const getProcessLineBadge = (processLine?: string) => {
      if (!processLine || processLine === 'select') return null
      
      const getBadgeColor = (processLine: string) => {
        switch (processLine) {
          case 'deposition1': return 'bg-red-100 text-red-800 hover:bg-red-200'
          case 'deposition2': return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
          case 'coating1': return 'bg-green-100 text-green-800 hover:bg-green-200'
          case 'coating2': return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
          case 'internal_coating': return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }
      }
      
      const getProcessLineText = (processLine: string) => {
        switch (processLine) {
          case 'deposition1': return '증착1'
          case 'deposition2': return '증착2'
          case 'coating1': return '1코팅'
          case 'coating2': return '2코팅'
          case 'internal_coating': return '내부코팅'
          default: return processLine
        }
      }
      
      return (
        <Badge 
          variant="secondary" 
          className={`${getBadgeColor(processLine)} px-1.5 py-0.5 text-[10px] leading-none`}
        >
          {getProcessLineText(processLine)}
        </Badge>
      )
    }

    // 사용자 이름 + 직급
    const displayName = user ? `${user.name} ${getRankText(user.rank)}` : 'SmartQC'
    
    // 직책 + 공정라인 정보 (분임조이고 공정라인이 선택된 경우)
    const jobTitleText = getPositionText(user?.position)
    const processLineBadge = user?.position === 'team_leader' && user?.processLine && user?.processLine !== 'select'
      ? getProcessLineBadge(user.processLine)
      : null

    // 관리자 여부 확인
    const isAdmin = user?.role === 'admin'
    
    // 기본 메뉴 (모든 사용자에게 표시)
    const mainMenuItems = [
      {
        title: "대시보드",
        url: "/",
        icon: IconDashboard,
        isActive: currentPath === "/",
      },
      {
        title: "품질 이력",
        url: "/quality-history",
        icon: IconChartBar,
        isActive: currentPath === "/quality-history",
      },
      {
        title: "보고서",
        url: "/reports",
        icon: IconReport,
        isActive: currentPath === "/reports",
      },
      {
        title: "설정",
        url: "/settings",
        icon: IconSettings,
        isActive: currentPath === "/settings",
      },
    ]

    // 관리자 메뉴 (데스크톱에서 관리자인 경우에만 표시)
    const adminMenuItems = (!isMobile && isAdmin) ? [
      {
        title: "불량 유형 관리",
        url: "/defect-types",
        icon: IconBug,
        isActive: currentPath === "/defect-types",
      },
      {
        title: "엑셀 가져오기",
        url: "/excel-import",
        icon: IconFileSpreadsheet,
        isActive: currentPath === "/excel-import",
      },
    ] : []
    
    return {
      user: {
        name: displayName,
        email: jobTitleText,
        avatar: "/avatars/01.png",
        processLineBadge: processLineBadge, // 배지 정보 추가
      },
      navMain: mainMenuItems,
      navAdmin: adminMenuItems,
    }
  }

  const handleInspectionCreate = () => {
    navigate('/inspection/create')
  }

  const handleLogoClick = () => {
    navigate('/')
  }

  const data = getMenuData()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div 
          className="flex items-center gap-2 px-2 py-3 cursor-pointer hover:bg-accent/50 rounded-lg transition-colors"
          onClick={handleLogoClick}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 flex-shrink-0 transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
            <IconMenu2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">SmartQC</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} title="SmartQC" showQuickCreate={true} onInspectionCreate={handleInspectionCreate} />
        {data.navAdmin && data.navAdmin.length > 0 && (
          <NavAdmin items={data.navAdmin} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}