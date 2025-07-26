"use client"

import { useState } from "react"
import { IconX, IconSettings } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EnvironmentDebugger } from "./EnvironmentDebugger"
import { useEnvironment } from "@/hooks/useEnvironment"

export function EnvironmentDebuggerSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: environment, isLoading, error } = useEnvironment()

  // 로딩 중이거나 에러가 있으면 표시하지 않음
  if (isLoading || error || !environment) {
    return null
  }

  const isDevelopment = environment.environment === 'development'
  const isDebugModeEnabled = environment.features.enableDebugMode

  // 개발 환경이 아니거나 디버그 모드가 비활성화된 경우 표시하지 않음
  if (!isDevelopment || !isDebugModeEnabled) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 right-4 z-50 h-10 w-10 rounded-full shadow-lg border"
        >
          <IconSettings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>환경변수 디버거</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <IconX className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="mt-6">
          <EnvironmentDebugger />
        </div>
      </DialogContent>
    </Dialog>
  )
} 