import { FileText } from "lucide-react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppSidebar } from "./AppSidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileHeader, MobileBottomNavigation } from "@/components/app"
import { EnvironmentDebuggerSidebar } from "@/components/EnvironmentDebuggerSidebar"
import { useAuth } from "@/hooks/useAuth"
import { useState } from "react"
import React from "react"
import { IconCirclePlus, IconLogout, IconSettings } from "@tabler/icons-react"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState("home")
  const location = useLocation()
  const navigate = useNavigate()
      const { user, logout } = useAuth()



  // 현재 경로에 따른 브레드크럼 생성
  const getBreadcrumbs = () => {
    const pathname = location.pathname
    
    if (pathname === '/') {
      return [
        { title: 'SmartQC', href: '/', icon: FileText },
        { title: '대시보드', href: null, isCurrent: true }
      ]
    }
    
    // 검사 타입별 브레드크럼
    if (pathname === '/inspection/create/incoming' || pathname === '/inspection/create/process' || pathname === '/inspection/create/shipment') {
      return [
        { title: '검사작성', href: null, isCurrent: true, icon: IconCirclePlus}
      ]
    }
    
    if (pathname === '/order') {
      return [
        { title: 'SmartQC', href: '/', icon: FileText },
        { title: '발주목록 업로드', href: null, isCurrent: true }
      ]
    }
    
    if (pathname === '/defect-types') {
      return [
        { title: 'SmartQC', href: '/', icon: FileText },
        { title: '표준 불량유형 관리', href: null, isCurrent: true }
      ]
    }
    
    if (pathname === '/quality-history') {
      return [
        { title: 'SmartQC', href: '/', icon: FileText },
        { title: '검사이력 조회', href: null, isCurrent: true }
      ]
    }
    
    if (pathname === '/excel-import') {
      return [
        { title: 'SmartQC', href: '/', icon: FileText },
        { title: '엑셀 가져오기', href: null, isCurrent: true }
      ]
    }
    
    if (pathname === '/reports') {
      return [
        { title: 'SmartQC', href: '/', icon: FileText },
        { title: '보고서', href: null, isCurrent: true }
      ]
    }
    
    if (pathname === '/settings') {
      return [
        { title: 'SmartQC', href: '/', icon: FileText },
        { title: '설정', href: null, isCurrent: true }
      ]
    }
    
    // 기본값
    return [
      { title: 'SmartQC', href: '/', icon: FileText },
      { title: '페이지', href: null, isCurrent: true }
    ]
  }

  const breadcrumbs = getBreadcrumbs()

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen overflow-x-hidden">
        {/* 모바일 헤더 */}
        <MobileHeader />
        
        {/* 모바일 메인 콘텐츠 */}
        <ScrollArea className="flex-1 overflow-x-hidden">
          <div className="p-4 pb-24">
            {children}
          </div>
        </ScrollArea>
        
        {/* 모바일 하단 네비게이션 */}
        <MobileBottomNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
        
        {/* 환경변수 디버거 사이드바 */}
        <EnvironmentDebuggerSidebar />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen">
        {/* 데스크톱 헤더 - 상단 고정 (높이 고정) */}
        <header className="flex h-16 shrink-0 items-center gap-2 bg-background border-b z-50">
          <div className="flex items-center gap-2 px-4 flex-nowrap overflow-hidden flex-1">
            <SidebarTrigger className="-ml-1 flex-shrink-0 size-5" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4 flex-shrink-0"
            />
            <Breadcrumb className="flex-1 min-w-0">
              <BreadcrumbList className="flex-nowrap">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem className="flex-shrink-0">
                      {crumb.href ? (
                        <BreadcrumbLink asChild className="flex items-center">
                          <Link to={crumb.href}>
                            {crumb.icon && <crumb.icon className="h-4 w-4 mr-1 flex-shrink-0" />}
                            <span className="truncate">{crumb.title}</span>
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="truncate">{crumb.title}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          {/* 사용자 메뉴 */}
          <div className="flex items-center gap-2 px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.position ? 
                        (user.position === 'employee' ? '사원' :
                         user.position === 'team_leader' ? '조장' :
                         user.position === 'chief' ? '주임' :
                         user.position === 'assistant_manager' ? '대리' :
                         user.position === 'deputy_manager' ? '부직장' :
                         user.position === 'manager' ? '과장' :
                         user.position === 'director' ? '직장' :
                         user.position === 'head_of_division' ? '본부장' :
                         user.position === 'executive' ? '상무' : user.position) : '직급 미설정'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.role === 'admin' ? '관리자' : 
                       user?.role === 'manager' ? '매니저' : '작업자'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <IconSettings className="mr-2 h-4 w-4" />
                  <span>설정</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <IconLogout className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <ScrollArea className="flex-1">
          <div className="p-4">
            {children}
          </div>
        </ScrollArea>
        
        {/* 환경변수 디버거 사이드바 */}
        <EnvironmentDebuggerSidebar />
      </SidebarInset>
    </SidebarProvider>
  )
}