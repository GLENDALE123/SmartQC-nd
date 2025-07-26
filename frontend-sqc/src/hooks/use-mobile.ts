import { useState, useEffect } from 'react'

/**
 * 모바일 디바이스 감지를 위한 커스텀 훅
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px 미만을 모바일로 간주
    }

    // 초기 체크
    checkIsMobile()

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', checkIsMobile)

    // 클린업
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
} 