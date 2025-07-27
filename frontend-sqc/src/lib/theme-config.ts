/**
 * DataTable 테마 설정 및 다크/라이트 모드 지원
 */

export type ThemeMode = 'light' | 'dark' | 'system'

// 테마별 색상 팔레트
export const themeColors = {
  light: {
    // 기본 색상
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(222.2 84% 4.9%)',
    
    // 카드 및 표면
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(222.2 84% 4.9%)',
    
    // 테이블 관련
    tableHeader: 'hsl(210 40% 96%)',
    tableHeaderForeground: 'hsl(215.4 16.3% 46.9%)',
    tableRow: 'hsl(0 0% 100%)',
    tableRowHover: 'hsl(210 40% 96%)',
    tableRowSelected: 'hsl(210 40% 96%)',
    tableBorder: 'hsl(214.3 31.8% 91.4%)',
    
    // 상태 색상
    status: {
      completed: {
        bg: 'hsl(142 76% 36%)',
        fg: 'hsl(0 0% 100%)',
        border: 'hsl(142 76% 36%)',
      },
      progress: {
        bg: 'hsl(221.2 83.2% 53.3%)',
        fg: 'hsl(0 0% 100%)',
        border: 'hsl(221.2 83.2% 53.3%)',
      },
      pending: {
        bg: 'hsl(47.9 95.8% 53.1%)',
        fg: 'hsl(26 83.3% 14.1%)',
        border: 'hsl(47.9 95.8% 53.1%)',
      },
      hold: {
        bg: 'hsl(24.6 95% 53.1%)',
        fg: 'hsl(0 0% 100%)',
        border: 'hsl(24.6 95% 53.1%)',
      },
      cancelled: {
        bg: 'hsl(0 84.2% 60.2%)',
        fg: 'hsl(0 0% 100%)',
        border: 'hsl(0 84.2% 60.2%)',
      },
    },
  },
  
  dark: {
    // 기본 색상
    background: 'hsl(222.2 84% 4.9%)',
    foreground: 'hsl(210 40% 98%)',
    
    // 카드 및 표면
    card: 'hsl(222.2 84% 4.9%)',
    cardForeground: 'hsl(210 40% 98%)',
    
    // 테이블 관련
    tableHeader: 'hsl(217.2 32.6% 17.5%)',
    tableHeaderForeground: 'hsl(215 20.2% 65.1%)',
    tableRow: 'hsl(222.2 84% 4.9%)',
    tableRowHover: 'hsl(217.2 32.6% 17.5%)',
    tableRowSelected: 'hsl(217.2 32.6% 17.5%)',
    tableBorder: 'hsl(217.2 32.6% 17.5%)',
    
    // 상태 색상
    status: {
      completed: {
        bg: 'hsl(142 76% 36%)',
        fg: 'hsl(0 0% 100%)',
        border: 'hsl(142 76% 36%)',
      },
      progress: {
        bg: 'hsl(217.2 91.2% 59.8%)',
        fg: 'hsl(222.2 84% 4.9%)',
        border: 'hsl(217.2 91.2% 59.8%)',
      },
      pending: {
        bg: 'hsl(47.9 95.8% 53.1%)',
        fg: 'hsl(26 83.3% 14.1%)',
        border: 'hsl(47.9 95.8% 53.1%)',
      },
      hold: {
        bg: 'hsl(24.6 95% 53.1%)',
        fg: 'hsl(0 0% 100%)',
        border: 'hsl(24.6 95% 53.1%)',
      },
      cancelled: {
        bg: 'hsl(0 62.8% 30.6%)',
        fg: 'hsl(0 0% 100%)',
        border: 'hsl(0 62.8% 30.6%)',
      },
    },
  },
} as const

// 테마 관련 CSS 변수 생성
export const generateThemeVariables = (mode: 'light' | 'dark') => {
  const colors = themeColors[mode]
  
  return {
    '--dt-background': colors.background,
    '--dt-foreground': colors.foreground,
    '--dt-card': colors.card,
    '--dt-card-foreground': colors.cardForeground,
    '--dt-table-header': colors.tableHeader,
    '--dt-table-header-foreground': colors.tableHeaderForeground,
    '--dt-table-row': colors.tableRow,
    '--dt-table-row-hover': colors.tableRowHover,
    '--dt-table-row-selected': colors.tableRowSelected,
    '--dt-table-border': colors.tableBorder,
    '--dt-status-completed-bg': colors.status.completed.bg,
    '--dt-status-completed-fg': colors.status.completed.fg,
    '--dt-status-progress-bg': colors.status.progress.bg,
    '--dt-status-progress-fg': colors.status.progress.fg,
    '--dt-status-pending-bg': colors.status.pending.bg,
    '--dt-status-pending-fg': colors.status.pending.fg,
    '--dt-status-hold-bg': colors.status.hold.bg,
    '--dt-status-hold-fg': colors.status.hold.fg,
    '--dt-status-cancelled-bg': colors.status.cancelled.bg,
    '--dt-status-cancelled-fg': colors.status.cancelled.fg,
  }
}

// 테마 전환 애니메이션 설정
export const themeTransition = {
  duration: '200ms',
  easing: 'ease-in-out',
  properties: [
    'background-color',
    'border-color',
    'color',
    'fill',
    'stroke',
    'opacity',
    'box-shadow',
    'transform',
  ],
}

// 반응형 테마 설정
export const responsiveTheme = {
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // 화면 크기별 테이블 설정
  tableSettings: {
    mobile: {
      density: 'compact',
      showColumns: ['select', 'name', 'status', 'actions'],
      pageSize: 10,
    },
    tablet: {
      density: 'normal',
      showColumns: ['select', 'name', 'status', 'date', 'actions'],
      pageSize: 20,
    },
    desktop: {
      density: 'comfortable',
      showColumns: 'all',
      pageSize: 50,
    },
  },
}

// 접근성 관련 테마 설정
export const accessibilityTheme = {
  // 고대비 모드 지원
  highContrast: {
    enabled: false,
    colors: {
      background: 'hsl(0 0% 0%)',
      foreground: 'hsl(0 0% 100%)',
      border: 'hsl(0 0% 100%)',
      focus: 'hsl(60 100% 50%)',
    },
  },
  
  // 모션 감소 설정
  reducedMotion: {
    enabled: false,
    disableAnimations: true,
    transitionDuration: '0ms',
  },
  
  // 폰트 크기 조정
  fontSize: {
    scale: 1, // 1.0 = 기본, 1.2 = 20% 증가
    minSize: '12px',
    maxSize: '24px',
  },
  
  // 포커스 표시 설정
  focus: {
    ringWidth: '2px',
    ringColor: 'hsl(221.2 83.2% 53.3%)',
    ringOffset: '2px',
  },
}

// 테마 유틸리티 함수들
export const themeUtils = {
  // 현재 테마 모드 감지
  getCurrentTheme: (): ThemeMode => {
    if (typeof window === 'undefined') return 'light'
    
    const stored = localStorage.getItem('theme') as ThemeMode
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored
    }
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  },
  
  // 테마 모드 설정
  setTheme: (mode: ThemeMode) => {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('theme', mode)
    
    const root = document.documentElement
    
    if (mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.setAttribute('data-theme', systemTheme)
      root.classList.toggle('dark', systemTheme === 'dark')
    } else {
      root.setAttribute('data-theme', mode)
      root.classList.toggle('dark', mode === 'dark')
    }
    
    // CSS 변수 업데이트
    const actualMode = mode === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode
    
    const variables = generateThemeVariables(actualMode)
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  },
  
  // 시스템 테마 변경 감지
  watchSystemTheme: (callback: (isDark: boolean) => void) => {
    if (typeof window === 'undefined') return () => {}
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => callback(e.matches)
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  },
  
  // 접근성 설정 감지
  watchAccessibilityPreferences: () => {
    if (typeof window === 'undefined') return () => {}
    
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    
    const updateAccessibility = () => {
      accessibilityTheme.reducedMotion.enabled = reducedMotionQuery.matches
      accessibilityTheme.highContrast.enabled = highContrastQuery.matches
      
      // CSS 변수 업데이트
      const root = document.documentElement
      root.style.setProperty('--dt-reduced-motion', reducedMotionQuery.matches ? '1' : '0')
      root.style.setProperty('--dt-high-contrast', highContrastQuery.matches ? '1' : '0')
    }
    
    reducedMotionQuery.addEventListener('change', updateAccessibility)
    highContrastQuery.addEventListener('change', updateAccessibility)
    
    updateAccessibility()
    
    return () => {
      reducedMotionQuery.removeEventListener('change', updateAccessibility)
      highContrastQuery.removeEventListener('change', updateAccessibility)
    }
  },
}

// 테마 프리셋
export const themePresets = {
  default: {
    name: '기본',
    description: '기본 테마',
    colors: themeColors,
  },
  
  corporate: {
    name: '기업용',
    description: '기업 환경에 적합한 차분한 테마',
    colors: {
      ...themeColors,
      light: {
        ...themeColors.light,
        background: 'hsl(210 20% 98%)',
        card: 'hsl(0 0% 100%)',
      },
    },
  },
  
  minimal: {
    name: '미니멀',
    description: '깔끔하고 단순한 테마',
    colors: {
      ...themeColors,
      light: {
        ...themeColors.light,
        tableBorder: 'hsl(0 0% 90%)',
        tableHeader: 'hsl(0 0% 98%)',
      },
    },
  },
} as const

export type ThemePreset = keyof typeof themePresets