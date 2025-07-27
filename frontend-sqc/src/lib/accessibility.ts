/**
 * 접근성을 고려한 DataTable 유틸리티
 * WCAG 2.1 AA 준수를 위한 헬퍼 함수들
 */

// 키보드 네비게이션 키 코드
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  TAB: 'Tab',
} as const

// ARIA 레이블 생성 함수들
export const createAriaLabels = {
  // 테이블 관련
  table: (name: string, rowCount: number) => 
    `${name} 테이블, ${rowCount}개 행`,
  
  columnHeader: (name: string, sortDirection?: 'asc' | 'desc' | 'none') => {
    const sortText = sortDirection === 'asc' ? '오름차순 정렬됨' :
                    sortDirection === 'desc' ? '내림차순 정렬됨' : '정렬 안됨'
    return `${name} 열 헤더, ${sortText}`
  },
  
  sortButton: (column: string, currentSort?: 'asc' | 'desc' | 'none') => {
    if (currentSort === 'asc') {
      return `${column} 열을 내림차순으로 정렬`
    } else if (currentSort === 'desc') {
      return `${column} 열 정렬 해제`
    } else {
      return `${column} 열을 오름차순으로 정렬`
    }
  },
  
  // 행 선택 관련
  selectRow: (rowIndex: number, isSelected: boolean) =>
    `${rowIndex + 1}번째 행 ${isSelected ? '선택 해제' : '선택'}`,
  
  selectAllRows: (isAllSelected: boolean, totalRows: number) =>
    `모든 행 ${isAllSelected ? '선택 해제' : '선택'} (총 ${totalRows}개)`,
  
  selectedRowsCount: (selectedCount: number, totalCount: number) =>
    `${totalCount}개 중 ${selectedCount}개 행이 선택됨`,
  
  // 페이지네이션 관련
  pagination: {
    info: (currentPage: number, totalPages: number, totalItems: number) =>
      `페이지 ${currentPage} / ${totalPages}, 총 ${totalItems}개 항목`,
    
    firstPage: '첫 페이지로 이동',
    previousPage: '이전 페이지로 이동',
    nextPage: '다음 페이지로 이동',
    lastPage: '마지막 페이지로 이동',
    
    pageSize: (size: number) => `페이지당 ${size}개 항목 표시`,
  },
  
  // 필터 관련
  filter: {
    search: (placeholder: string) => `테이블 검색: ${placeholder}`,
    dateRange: '날짜 범위 필터',
    faceted: (column: string, selectedCount: number) =>
      `${column} 필터, ${selectedCount}개 선택됨`,
    reset: '모든 필터 초기화',
    clear: (filterName: string) => `${filterName} 필터 지우기`,
  },
  
  // 액션 관련
  actions: {
    refresh: '데이터 새로고침',
    export: '데이터 내보내기',
    columnVisibility: '열 표시/숨기기 설정',
    rowActions: (rowIndex: number) => `${rowIndex + 1}번째 행 액션 메뉴`,
  },
}

// 키보드 이벤트 핸들러 헬퍼
export const handleKeyboardNavigation = {
  // 테이블 행 네비게이션
  tableRow: (event: React.KeyboardEvent, callbacks: {
    onEnter?: () => void
    onSpace?: () => void
    onArrowUp?: () => void
    onArrowDown?: () => void
  }) => {
    switch (event.key) {
      case KEYBOARD_KEYS.ENTER:
        event.preventDefault()
        callbacks.onEnter?.()
        break
      case KEYBOARD_KEYS.SPACE:
        event.preventDefault()
        callbacks.onSpace?.()
        break
      case KEYBOARD_KEYS.ARROW_UP:
        event.preventDefault()
        callbacks.onArrowUp?.()
        break
      case KEYBOARD_KEYS.ARROW_DOWN:
        event.preventDefault()
        callbacks.onArrowDown?.()
        break
    }
  },
  
  // 페이지네이션 네비게이션
  pagination: (event: React.KeyboardEvent, callbacks: {
    onHome?: () => void
    onEnd?: () => void
    onPageUp?: () => void
    onPageDown?: () => void
  }) => {
    switch (event.key) {
      case KEYBOARD_KEYS.HOME:
        event.preventDefault()
        callbacks.onHome?.()
        break
      case KEYBOARD_KEYS.END:
        event.preventDefault()
        callbacks.onEnd?.()
        break
      case KEYBOARD_KEYS.PAGE_UP:
        event.preventDefault()
        callbacks.onPageUp?.()
        break
      case KEYBOARD_KEYS.PAGE_DOWN:
        event.preventDefault()
        callbacks.onPageDown?.()
        break
    }
  },
  
  // 드롭다운/메뉴 네비게이션
  dropdown: (event: React.KeyboardEvent, callbacks: {
    onEscape?: () => void
    onArrowUp?: () => void
    onArrowDown?: () => void
    onEnter?: () => void
  }) => {
    switch (event.key) {
      case KEYBOARD_KEYS.ESCAPE:
        event.preventDefault()
        callbacks.onEscape?.()
        break
      case KEYBOARD_KEYS.ARROW_UP:
        event.preventDefault()
        callbacks.onArrowUp?.()
        break
      case KEYBOARD_KEYS.ARROW_DOWN:
        event.preventDefault()
        callbacks.onArrowDown?.()
        break
      case KEYBOARD_KEYS.ENTER:
        event.preventDefault()
        callbacks.onEnter?.()
        break
    }
  },
}

// 포커스 관리 유틸리티
export const focusManagement = {
  // 포커스 가능한 요소 선택자
  focusableSelectors: [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', '),
  
  // 요소 내의 포커스 가능한 첫 번째/마지막 요소 찾기
  getFirstFocusable: (container: HTMLElement): HTMLElement | null => {
    return container.querySelector(focusManagement.focusableSelectors)
  },
  
  getLastFocusable: (container: HTMLElement): HTMLElement | null => {
    const focusables = container.querySelectorAll(focusManagement.focusableSelectors)
    return focusables[focusables.length - 1] as HTMLElement || null
  },
  
  // 포커스 트랩 (모달, 드롭다운 등에서 사용)
  trapFocus: (container: HTMLElement, event: KeyboardEvent) => {
    if (event.key !== KEYBOARD_KEYS.TAB) return
    
    const firstFocusable = focusManagement.getFirstFocusable(container)
    const lastFocusable = focusManagement.getLastFocusable(container)
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        event.preventDefault()
        firstFocusable?.focus()
      }
    }
  },
}

// 스크린 리더 지원 유틸리티
export const screenReaderSupport = {
  // 라이브 리전 업데이트
  announceToScreenReader: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    // 메시지 전달 후 제거
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  },
  
  // 상태 변경 알림
  announceStateChange: (message: string) => {
    screenReaderSupport.announceToScreenReader(message, 'assertive')
  },
  
  // 로딩 상태 알림
  announceLoading: (isLoading: boolean, context: string = '데이터') => {
    const message = isLoading ? `${context} 로딩 중` : `${context} 로딩 완료`
    screenReaderSupport.announceToScreenReader(message)
  },
}

// 색상 대비 검증 (개발 시 사용)
export const colorContrast = {
  // 색상을 RGB로 변환
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },
  
  // 상대 휘도 계산
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },
  
  // 대비율 계산
  getContrastRatio: (color1: string, color2: string): number => {
    const rgb1 = colorContrast.hexToRgb(color1)
    const rgb2 = colorContrast.hexToRgb(color2)
    
    if (!rgb1 || !rgb2) return 0
    
    const lum1 = colorContrast.getLuminance(rgb1.r, rgb1.g, rgb1.b)
    const lum2 = colorContrast.getLuminance(rgb2.r, rgb2.g, rgb2.b)
    
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  },
  
  // WCAG AA/AAA 준수 확인
  meetsWCAG: (color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = colorContrast.getContrastRatio(color1, color2)
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7
  },
}

// 반응형 접근성 헬퍼
export const responsiveAccessibility = {
  // 모바일에서 터치 타겟 크기 확인
  getTouchTargetSize: (element: HTMLElement): { width: number; height: number } => {
    const rect = element.getBoundingClientRect()
    return { width: rect.width, height: rect.height }
  },
  
  // 최소 터치 타겟 크기 (44px x 44px) 확인
  meetsTouchTargetSize: (element: HTMLElement): boolean => {
    const { width, height } = responsiveAccessibility.getTouchTargetSize(element)
    return width >= 44 && height >= 44
  },
  
  // 모바일 접근성 개선을 위한 클래스
  mobileAccessibilityClasses: {
    touchTarget: 'min-h-[44px] min-w-[44px]',
    tapHighlight: 'tap-highlight-transparent',
    scrollable: 'overflow-auto scrollbar-thin',
  },
}

// 에러 처리 및 폴백
export const accessibilityFallbacks = {
  // 이미지 alt 텍스트 생성
  generateAltText: (context: string, data?: any): string => {
    if (data && typeof data === 'object') {
      return `${context}: ${Object.keys(data).join(', ')}`
    }
    return context
  },
  
  // 빈 상태 메시지
  emptyStateMessage: (context: string): string => {
    return `${context}에 표시할 데이터가 없습니다. 검색 조건을 변경하거나 필터를 초기화해보세요.`
  },
  
  // 에러 상태 메시지
  errorStateMessage: (context: string, error?: string): string => {
    const baseMessage = `${context} 로딩 중 오류가 발생했습니다.`
    return error ? `${baseMessage} 오류: ${error}` : baseMessage
  },
}