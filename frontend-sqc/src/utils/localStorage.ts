interface StorageItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

/**
 * 로컬 스토리지에 TTL이 적용된 데이터를 저장합니다.
 * @param key 저장할 키
 * @param data 저장할 데이터
 * @param ttlHours TTL 시간 (시간 단위, 기본값: 24시간)
 */
export function setLocalStorageWithTTL<T>(key: string, data: T, ttlHours: number = 24): void {
  const item: StorageItem<T> = {
    data,
    timestamp: Date.now(),
    ttl: ttlHours * 60 * 60 * 1000 // 시간을 밀리초로 변환
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(item))
  } catch (error) {
    // 저장 실패 시 무시
  }
}

/**
 * 로컬 스토리지에서 TTL이 적용된 데이터를 조회합니다.
 * @param key 조회할 키
 * @param defaultValue 기본값 (TTL 만료 시 반환)
 * @returns 저장된 데이터 또는 기본값
 */
export function getLocalStorageWithTTL<T>(key: string, defaultValue: T): T {
  try {
    const itemString = localStorage.getItem(key)
    if (!itemString) {
      return defaultValue
    }

    const item: StorageItem<T> = JSON.parse(itemString)
    const now = Date.now()
    
    // TTL 확인
    if (now - item.timestamp > item.ttl) {
      // TTL 만료 시 데이터 삭제
      localStorage.removeItem(key)
      return defaultValue
    }
    
    return item.data
  } catch (error) {
    return defaultValue
  }
}

/**
 * 로컬 스토리지에서 특정 키의 데이터를 삭제합니다.
 * @param key 삭제할 키
 */
export function removeLocalStorageWithTTL(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    // 삭제 실패 시 무시
  }
}

/**
 * 로컬 스토리지의 모든 만료된 데이터를 정리합니다.
 * authToken과 user는 인증 관련 데이터이므로 정리에서 제외합니다.
 */
export function cleanupExpiredLocalStorage(): void {
  try {
    const keys = Object.keys(localStorage)
    const now = Date.now()
    
    // 인증 관련 키는 정리에서 제외
    const excludeKeys = ['authToken', 'user']
    
    keys.forEach(key => {
      // 인증 관련 키는 건드리지 않음
      if (excludeKeys.includes(key)) {
        return
      }
      
      try {
        const itemString = localStorage.getItem(key)
        if (itemString) {
          const item: StorageItem<any> = JSON.parse(itemString)
          if (now - item.timestamp > item.ttl) {
            localStorage.removeItem(key)
          }
        }
      } catch (error) {
        // JSON 파싱 실패 시 해당 키 삭제 (단, 인증 키는 제외)
        if (!excludeKeys.includes(key)) {
          localStorage.removeItem(key)
        }
      }
    })
  } catch (error) {
    console.error('로컬 스토리지 정리 실패:', error)
  }
}