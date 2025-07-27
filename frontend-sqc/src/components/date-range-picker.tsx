"use client"

import * as React from "react"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format, subDays, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { ko } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

interface DateRangePickerProps
  extends React.ComponentPropsWithoutRef<typeof PopoverContent> {
  /**
   * The selected date range.
   * @default undefined
   * @type DateRange
   * @example { from: new Date(), to: new Date() }
   */
  dateRange?: DateRange

  /**
   * Callback function when date range changes
   */
  onDateRangeChange?: (range: DateRange | undefined) => void

  /**
   * The placeholder text of the calendar trigger button.
   * @default "Pick a date"
   * @type string | undefined
   */
  placeholder?: string

  /**
   * The variant of the calendar trigger button.
   * @default "outline"
   * @type "default" | "outline" | "secondary" | "ghost"
   */
  triggerVariant?: Exclude<ButtonProps["variant"], "destructive" | "link">

  /**
   * The size of the calendar trigger button.
   * @default "default"
   * @type "default" | "sm" | "lg"
   */
  triggerSize?: Exclude<ButtonProps["size"], "icon">

  /**
   * The class name of the calendar trigger button.
   * @default undefined
   * @type string
   */
  triggerClassName?: string
}

// 날짜 범위 프리셋 정의
const dateRangePresets = [
  {
    label: "오늘",
    value: () => ({
      from: startOfToday(),
      to: endOfToday(),
    }),
  },
  {
    label: "어제",
    value: () => ({
      from: subDays(new Date(), 1),
      to: subDays(new Date(), 1),
    }),
  },
  {
    label: "지난 7일",
    value: () => ({
      from: subDays(new Date(), 6),
      to: new Date(),
    }),
  },
  {
    label: "지난 30일",
    value: () => ({
      from: subDays(new Date(), 29),
      to: new Date(),
    }),
  },
  {
    label: "이번 주",
    value: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: "이번 달",
    value: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
]

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = "날짜 선택",
  triggerVariant = "outline",
  triggerSize = "default",
  triggerClassName,
  className,
  ...props
}: DateRangePickerProps) {
  const from = dateRange?.from
  const to = dateRange?.to

  const handlePresetSelect = (preset: typeof dateRangePresets[0]) => {
    const range = preset.value()
    onDateRangeChange?.(range)
  }

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={triggerVariant}
            size={triggerSize}
            className={cn(
              "w-full justify-start truncate text-left font-normal",
              !from && !to && "text-muted-foreground",
              triggerClassName
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {from ? (
              to ? (
                <>
                  {format(from, "yyyy년 MM월 dd일", { locale: ko })} -{" "}
                  {format(to, "yyyy년 MM월 dd일", { locale: ko })}
                </>
              ) : (
                format(from, "yyyy년 MM월 dd일", { locale: ko })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-auto p-0", className)} {...props}>
          <div className="flex">
            {/* 프리셋 사이드바 */}
            <div className="flex flex-col border-r">
              <div className="p-3">
                <h4 className="text-sm font-medium">빠른 선택</h4>
              </div>
              <div className="flex flex-col space-y-1 p-2">
                {dateRangePresets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="justify-start text-left font-normal"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <Separator />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => onDateRangeChange?.(undefined)}
                >
                  초기화
                </Button>
              </div>
            </div>
            
            {/* 캘린더 */}
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={from}
                selected={dateRange}
                disabled={(date) => date > new Date()}
                onSelect={onDateRangeChange}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}