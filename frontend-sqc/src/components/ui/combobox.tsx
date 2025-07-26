"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxItem {
  value: string
  label: string
  description?: string
}

interface ComboboxProps {
  items: ComboboxItem[]
  placeholder?: string
  value: string
  onValueChange: (value: string) => void
  onCustomInput?: (value: string) => void
  className?: string
  disabled?: boolean
  icon?: React.ReactNode
}

export function Combobox({
  items,
  placeholder = "선택하거나 입력하세요...",
  value,
  onValueChange,
  onCustomInput,
  className,
  disabled = false,
  icon,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)
  const [isMobile, setIsMobile] = React.useState(false)
  
  // 모바일 환경 감지
  React.useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth < 1024
      setIsMobile(isTouchDevice && isSmallScreen)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
  }

  const handleSelect = (selectedValue: string) => {
    const selectedItem = items.find(item => item.value === selectedValue)
    if (selectedItem) {
      onValueChange(selectedItem.value)
      setInputValue(selectedItem.label)
    }
    setOpen(false)
  }

  const handleCustomConfirm = () => {
    if (inputValue.trim() && onCustomInput) {
      onCustomInput(inputValue.trim())
      setOpen(false)
    }
  }

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(inputValue.toLowerCase())
  )

  const hasExactMatch = items.some(item => 
    item.label.toLowerCase() === inputValue.toLowerCase()
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            <span className="truncate">
              {inputValue || placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={handleInputChange}
            className="h-9"
            autoFocus={!isMobile}
            tabIndex={isMobile ? -1 : 0}
          />
          <CommandList>
            <CommandEmpty>
              {onCustomInput && inputValue.trim() && !hasExactMatch && (
                <div className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleCustomConfirm}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    "{inputValue}" 추가
                  </Button>
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={handleSelect}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 