"use client"

import { FileText, ArrowLeft } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
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
import { useAuth } from "@/hooks/useAuth"
import { IconLogout, IconSettings } from "@tabler/icons-react"

interface MobileHeaderProps {
  className?: string
}

export function MobileHeader({ className = "" }: MobileHeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
      const { user, logout } = useAuth()
  
  // 검사작성페이지인지 확인
  const isInspectionCreatePage = location.pathname.startsWith('/inspection/create')
  
  return (
    <header className={`flex h-16 shrink-0 items-center justify-between px-4 border-b bg-background sticky top-0 z-50 ${className}`}>
      <div className="flex items-center gap-2">
        {isInspectionCreatePage ? (
          // 검사작성페이지일 때 뒤로가기 버튼
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-semibold">검사작성</span>
          </div>
        ) : (
          // 다른 페이지일 때 기존 로고
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold">SmartQC</span>
          </div>
        )}
      </div>
      
      {/* 모바일 사용자 메뉴 */}
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
    </header>
  )
} 