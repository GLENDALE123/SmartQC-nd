"use client"

import React, { useState, useRef, useEffect } from "react"
import { IconCheck } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
  presetColors?: Array<{ name: string; value: string; hex: string }>
  showCustomPicker?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost"
}

const DEFAULT_PRESET_COLORS = [
  { name: "검정", value: "bg-black", hex: "#000000" },
  { name: "회색", value: "bg-gray-500", hex: "#6b7280" },
  { name: "진한 파랑", value: "bg-blue-800", hex: "#1e40af" },
  { name: "빨강", value: "bg-red-500", hex: "#ef4444" },
  { name: "주황", value: "bg-orange-500", hex: "#f97316" },
  { name: "갈색", value: "bg-amber-700", hex: "#b45309" },
  { name: "녹색", value: "bg-green-500", hex: "#22c55e" },
  { name: "청록", value: "bg-teal-500", hex: "#14b8a6" },
  { name: "보라", value: "bg-purple-500", hex: "#a855f7" },
  { name: "분홍", value: "bg-pink-500", hex: "#ec4899" },
  { name: "연한 파랑", value: "bg-blue-400", hex: "#60a5fa" },
  { name: "연한 녹색", value: "bg-green-400", hex: "#4ade80" },
  { name: "연한 빨강", value: "bg-red-400", hex: "#f87171" },
  { name: "연한 주황", value: "bg-orange-400", hex: "#fb923c" },
  { name: "연한 보라", value: "bg-purple-400", hex: "#c084fc" },
  { name: "연한 분홍", value: "bg-pink-400", hex: "#f472b6" },
  { name: "연한 청록", value: "bg-teal-400", hex: "#2dd4bf" },
  { name: "연한 갈색", value: "bg-amber-500", hex: "#f59e0b" },
  { name: "연한 회색", value: "bg-gray-400", hex: "#9ca3af" },
  { name: "흰색", value: "bg-white", hex: "#ffffff" },
]

export function ColorPicker({
  value = "",
  onChange,
  presetColors = DEFAULT_PRESET_COLORS,
  showCustomPicker = true,
  triggerClassName,
  contentClassName,
  size = "md",
  variant = "outline"
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(value)
  const [customColor, setCustomColor] = useState("#059669")
  const [hue, setHue] = useState(160) // 녹색 계열
  const [saturation, setSaturation] = useState(50)
  const [value_, setValue_] = useState(60)

  // 초기값 설정
  useEffect(() => {
    if (value) {
      // HEX 값인 경우
      if (value.startsWith('#')) {
        setCustomColor(value)
        const hsv = hexToHsv(value)
        setHue(hsv.h)
        setSaturation(hsv.s)
        setValue_(hsv.v)
      } else {
        // 프리셋 색상인 경우
        const colorOption = presetColors.find(option => option.value === value)
        if (colorOption) {
          setSelectedColor(value)
          setCustomColor(colorOption.hex)
          const hsv = hexToHsv(colorOption.hex)
          setHue(hsv.h)
          setSaturation(hsv.s)
          setValue_(hsv.v)
        }
      }
    }
  }, [value, presetColors])
  
  const paletteRef = useRef<HTMLDivElement>(null)
  const hueSliderRef = useRef<HTMLDivElement>(null)
  const [isDraggingPalette, setIsDraggingPalette] = useState(false)
  const [isDraggingHue, setIsDraggingHue] = useState(false)

  // HSV to HEX 변환
  const hsvToHex = (h: number, s: number, v: number): string => {
    const c = (v / 100) * (s / 100)
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = (v / 100) - c

    let r = 0, g = 0, b = 0

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c
    } else {
      r = c; g = 0; b = x
    }

    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0')
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0')
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0')

    return `#${rHex}${gHex}${bHex}`
  }

  // HEX to HSV 변환
  const hexToHsv = (hex: string): { h: number; s: number; v: number } => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min

    let h = 0
    if (diff === 0) {
      h = 0
    } else if (max === r) {
      h = ((g - b) / diff) % 6
    } else if (max === g) {
      h = (b - r) / diff + 2
    } else {
      h = (r - g) / diff + 4
    }
    h = h * 60
    if (h < 0) h += 360

    const s = max === 0 ? 0 : diff / max * 100
    const v = max * 100

    return { h, s, v }
  }

  // 현재 선택된 색상의 HEX 값 가져오기
  const getCurrentHexColor = () => {
    const colorOption = presetColors.find(option => option.value === selectedColor)
    return colorOption?.hex || customColor
  }

  // 색상 변경 핸들러
  const handleColorChange = (colorValue: string) => {
    setSelectedColor(colorValue)
    // 프리셋 색상의 경우 HEX 값을 전달
    const colorOption = presetColors.find(option => option.value === colorValue)
    onChange?.(colorOption?.hex || colorValue)
  }

  // 커스텀 색상 변경 핸들러
  const handleCustomColorChange = (hexColor: string) => {
    setCustomColor(hexColor)
    // HEX 값을 직접 전달
    onChange?.(hexColor)
    
    // HEX를 HSV로 변환하여 상태 업데이트
    const hsv = hexToHsv(hexColor)
    setHue(hsv.h)
    setSaturation(hsv.s)
    setValue_(hsv.v)
  }

  // 색상 팔레트 클릭/드래그 핸들러
  const handlePaletteMouseDown = (e: React.MouseEvent) => {
    setIsDraggingPalette(true)
    handlePaletteClick(e)
  }

  const handlePaletteMouseMove = (e: React.MouseEvent) => {
    if (isDraggingPalette) {
      handlePaletteClick(e)
    }
  }

  const handlePaletteMouseUp = () => {
    setIsDraggingPalette(false)
  }

  const handlePaletteClick = (e: React.MouseEvent) => {
    if (!paletteRef.current) return

    const rect = paletteRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))

    setSaturation(x * 100)
    setValue_((1 - y) * 100)

    const newHex = hsvToHex(hue, x * 100, (1 - y) * 100)
    handleCustomColorChange(newHex)
  }

  // 색조 슬라이더 핸들러
  const handleHueMouseDown = (e: React.MouseEvent) => {
    setIsDraggingHue(true)
    handleHueClick(e)
  }

  const handleHueMouseMove = (e: React.MouseEvent) => {
    if (isDraggingHue) {
      handleHueClick(e)
    }
  }

  const handleHueMouseUp = () => {
    setIsDraggingHue(false)
  }

  const handleHueClick = (e: React.MouseEvent) => {
    if (!hueSliderRef.current) return

    const rect = hueSliderRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    
    const newHue = x * 360
    setHue(newHue)

    const newHex = hsvToHex(newHue, saturation, value_)
    handleCustomColorChange(newHex)
  }

  // 전역 마우스 이벤트 리스너
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDraggingPalette(false)
      setIsDraggingHue(false)
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingPalette && paletteRef.current) {
        const rect = paletteRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))

        setSaturation(x * 100)
        setValue_((1 - y) * 100)

        const newHex = hsvToHex(hue, x * 100, (1 - y) * 100)
        handleCustomColorChange(newHex)
      }

      if (isDraggingHue && hueSliderRef.current) {
        const rect = hueSliderRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        
        const newHue = x * 360
        setHue(newHue)

        const newHex = hsvToHex(newHue, saturation, value_)
        handleCustomColorChange(newHex)
      }
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('mousemove', handleGlobalMouseMove)

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDraggingPalette, isDraggingHue, hue, saturation, value_])

  // 색상 팔레트 배경 생성
  const getPaletteBackground = () => {
    const currentHue = hsvToHex(hue, 100, 100)
    return `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${currentHue})`
  }

  // 색조 슬라이더 배경 생성
  const getHueBackground = () => {
    return 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
  }

  // 크기별 스타일
  const sizeStyles = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
          className={cn(
            "flex items-center gap-2",
            triggerClassName
          )}
        >
          <div
            className={cn(
              "rounded border-2 border-border transition-all",
              sizeStyles[size]
            )}
            style={{ backgroundColor: getCurrentHexColor() }}
          />
          <span>색상 선택</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-80 p-4",
          contentClassName
        )}
        align="start"
      >
        <div className="space-y-4">
          {/* 2D 색상 팔레트 */}
          {showCustomPicker && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                색상 선택
              </Label>
              <div className="space-y-3">
                {/* 메인 색상 팔레트 */}
                <div
                  ref={paletteRef}
                  className="w-full h-32 rounded-lg border cursor-crosshair relative"
                  style={{ background: getPaletteBackground() }}
                  onMouseDown={handlePaletteMouseDown}
                  onMouseMove={handlePaletteMouseMove}
                  onMouseUp={handlePaletteMouseUp}
                >
                  {/* 선택자 */}
                  <div
                    className="absolute w-3 h-3 border-2 border-white rounded-full shadow-lg pointer-events-none"
                    style={{
                      left: `${saturation}%`,
                      top: `${100 - value_}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                </div>

                {/* 색조 슬라이더 */}
                <div
                  ref={hueSliderRef}
                  className="w-full h-6 rounded border cursor-pointer relative"
                  style={{ background: getHueBackground() }}
                  onMouseDown={handleHueMouseDown}
                  onMouseMove={handleHueMouseMove}
                  onMouseUp={handleHueMouseUp}
                >
                  {/* 슬라이더 핸들 */}
                  <div
                    className="absolute w-3 h-6 border-2 border-white rounded shadow-lg pointer-events-none"
                    style={{
                      left: `${(hue / 360) * 100}%`,
                      transform: 'translateX(-50%)'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 프리셋 색상 그리드 */}
          <div>
            <Label className="text-sm font-medium mb-2 block">기본 색상</Label>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={cn(
                    "h-8 w-8 rounded-md border-2 transition-all hover:scale-105",
                    selectedColor === color.value
                      ? "border-primary scale-110"
                      : "border-border hover:border-primary/50"
                  )}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleColorChange(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* HEX 입력 및 저장 */}
          <div className="flex items-center gap-2">
            <Input
              value={getCurrentHexColor()}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="flex-1 text-sm font-mono"
              placeholder="#000000"
            />
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <IconCheck className="h-4 w-4 mr-1" />
              저장
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}