import { useState, useEffect, useCallback, useRef } from 'react';
import { orderApi, OrderInfoResponseDto, OrderSearchResponse } from '../api/orders';
import { Order } from '../types/models';
import { TableQueryParams } from '../types/table-config';
import { PaginatedResponse } from '../types/api';

// 훅 옵션 인터페이스
export interface UseOrdersOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  cacheTime?: number;
  onSuccess?: (data: PaginatedResponse<Order>) => void;
  onError?: (error: Error) => void;
}

// 훅 반환 타입
export interface UseOrdersResult {
  data: PaginatedResponse<Order> | null;
  orders: Order[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  total: number;
}

// 검색 훅 반환 타입
export interface UseOrderSearchResult {
  data: OrderSearchResponse | null;
  orders: OrderInfoResponseDto[];
  loading: boolean;
  error: Error | null;
  search: (orderNumbers: string[]) => Promise<void>;
  clear: () => void;
  missingOrderNumbers: string[];
  invalidOrderNumbers: string[];
  totalRequested: number;
  totalFound: number;
}

// 단일 주문 훅 반환 타입
export interface UseOrderResult {
  data: OrderInfoResponseDto | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// 캐시 관리
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleTime: number;
}

class OrderCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultStaleTime = 5 * 60 * 1000; // 5분

  set<T>(key: string, data: T, staleTime = this.defaultStaleTime): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      staleTime,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isStale = Date.now() - entry.timestamp > entry.staleTime;
    if (isStale) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keysToDelete = Array.from(this.cache.keys()).filter(key =>
      key.includes(pattern)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

const orderCache = new OrderCache();

/**
 * 주문 목록 조회 훅
 */
export function useOrders(
  params: TableQueryParams = {},
  options: UseOrdersOptions = {}
): UseOrdersResult {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    refetchInterval,
    staleTime = 5 * 60 * 1000,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<PaginatedResponse<Order> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestRef = useRef<string>(''); // 마지막 요청 추적

  // params를 JSON 문자열로 변환하여 의존성 문제 해결
  const paramsString = JSON.stringify(params);

  // 캐시 키 생성
  const getCacheKey = useCallback((params: TableQueryParams) => {
    return `orders:${JSON.stringify(params)}`;
  }, []);

  // 데이터 페치 함수
  const fetchOrders = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    const currentParams = JSON.parse(paramsString);
    const cacheKey = getCacheKey(currentParams);
    
    // 중복 요청 방지 - 동일한 요청이 이미 진행 중인 경우 무시
    if (lastRequestRef.current === cacheKey && loading && !forceRefresh) {
      console.log('🔄 동일한 요청이 진행 중입니다. 중복 요청을 방지합니다.');
      return;
    }
    
    lastRequestRef.current = cacheKey;
    
    // 캐시된 데이터 확인 (강제 새로고침이 아닌 경우)
    if (!forceRefresh) {
      const cachedData = orderCache.get<PaginatedResponse<Order>>(cacheKey);
      if (cachedData) {
        console.log('📦 캐시된 데이터를 사용합니다:', cacheKey);
        setData(cachedData);
        setError(null);
        setLoading(false);
        // onSuccess 콜백 직접 호출
        if (onSuccess) {
          try {
            onSuccess(cachedData);
          } catch (err) {
            console.warn('onSuccess 콜백 실행 중 오류:', err);
          }
        }
        return;
      }
    }

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    console.log('🌐 API 요청 시작:', cacheKey);

    try {
      const response = await orderApi.getOrders(currentParams);
      
      // 요청이 취소된 경우 무시
      if (abortControllerRef.current?.signal.aborted) {
        console.log('❌ 요청이 취소되었습니다.');
        return;
      }
      
      if (response.success && response.data) {
        console.log('✅ API 요청 성공:', cacheKey);
        setData(response.data);
        orderCache.set(cacheKey, response.data, staleTime);
        // onSuccess 콜백 직접 호출
        if (onSuccess) {
          try {
            onSuccess(response.data);
          } catch (err) {
            console.warn('onSuccess 콜백 실행 중 오류:', err);
          }
        }
      } else {
        throw new Error(response.message || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      // 요청이 취소된 경우 무시
      if (abortControllerRef.current?.signal.aborted) {
        console.log('❌ 요청이 취소되었습니다.');
        return;
      }
      
      const error = err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.');
      
      console.error('❌ API 요청 실패:', cacheKey, error.message);
      
      // 네트워크 오류인 경우 자동 재시도 중단
      if (error.name === 'NetworkError' || 
          (error as any).code === 'NETWORK_ERROR' ||
          (error as any).code === 'ECONNREFUSED' ||
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('서버에 연결할 수 없습니다')) {
        
        console.warn('🔌 네트워크 연결 오류로 인해 자동 재시도를 중단합니다.');
        
        // 주기적 리페치 중단
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // 사용자 친화적 에러 메시지 설정
        const networkError = new Error('서버에 연결할 수 없습니다. 서버 상태를 확인해주세요.');
        networkError.name = 'NetworkError';
        setError(networkError);
      } else {
        setError(error);
      }
      
      // onError 콜백 직접 호출
      if (onError) {
        try {
          onError(error);
        } catch (err) {
          console.warn('onError 콜백 실행 중 오류:', err);
        }
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
      lastRequestRef.current = ''; // 요청 완료 후 초기화
    }
  }, [enabled, paramsString, staleTime, loading]); // loading 의존성 추가

  // 새로고침 함수
  const refresh = useCallback(async () => {
    try {
      orderCache.invalidate('orders:');
      await fetchOrders(true);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('새로고침 중 오류가 발생했습니다.'));
    }
  }, [fetchOrders, onError]);

  // 리페치 함수
  const refetch = useCallback(async () => {
    await fetchOrders(true);
  }, [fetchOrders]);

  // 초기 데이터 로드 및 params 변경 시 데이터 로드
  useEffect(() => {
    if (enabled) {
      fetchOrders();
    }
  }, [enabled, paramsString]); // fetchOrders 의존성 제거, paramsString 변경 시에만 호출

  // 윈도우 포커스 시 리페치
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      // 네트워크 오류 상태가 아닐 때만 리페치
      if (!error || error.name !== 'NetworkError') {
        fetchOrders();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, error]); // fetchOrders 의존성 제거

  // 주기적 리페치
  useEffect(() => {
    if (!refetchInterval) return;

    // 네트워크 오류 상태일 때는 주기적 리페치 중단
    if (error && error.name === 'NetworkError') {
      return;
    }

    intervalRef.current = setInterval(() => {
      // 네트워크 오류 상태가 아닐 때만 리페치
      if (!error || error.name !== 'NetworkError') {
        fetchOrders();
      }
    }, refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, error]); // fetchOrders 의존성 제거

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    orders: data?.data || [],
    loading,
    error,
    refetch,
    refresh,
    hasNextPage: data?.pagination.hasNext || false,
    hasPreviousPage: data?.pagination.hasPrevious || false,
    totalPages: data?.pagination.totalPages || 0,
    currentPage: data?.pagination.page || 1,
    pageSize: data?.pagination.pageSize || 10,
    total: data?.pagination.total || 0,
  };
}

/**
 * 주문 검색 훅 (발주번호 기반)
 */
export function useOrderSearch(): UseOrderSearchResult {
  const [data, setData] = useState<OrderSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (orderNumbers: string[]) => {
    if (!orderNumbers.length) {
      setData(null);
      setError(null);
      return;
    }

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await orderApi.searchByOrderNumbers(orderNumbers);
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        throw new Error(response.message || '검색에 실패했습니다.');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.');
      setError(error);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  const clear = useCallback(() => {
    setData(null);
    setError(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    orders: data?.orders || [],
    loading,
    error,
    search,
    clear,
    missingOrderNumbers: data?.missingOrderNumbers || [],
    invalidOrderNumbers: data?.invalidOrderNumbers || [],
    totalRequested: data?.totalRequested || 0,
    totalFound: data?.totalFound || 0,
  };
}

/**
 * 단일 주문 조회 훅
 */
export function useOrder(orderNumber: string | null): UseOrderResult {
  const [data, setData] = useState<OrderInfoResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderNumber) {
      setData(null);
      setError(null);
      return;
    }

    const cacheKey = `order:${orderNumber}`;
    
    // 캐시된 데이터 확인
    const cachedData = orderCache.get<OrderInfoResponseDto>(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setError(null);
      return;
    }

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await orderApi.getByOrderNumber(orderNumber);
      
      if (response.success) {
        setData(response.data);
        if (response.data) {
          orderCache.set(cacheKey, response.data);
        }
      } else {
        throw new Error(response.message || '주문 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.');
      setError(error);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [orderNumber]);

  const refetch = useCallback(async () => {
    if (orderNumber) {
      orderCache.invalidate(`order:${orderNumber}`);
      await fetchOrder();
    }
  }, [orderNumber, fetchOrder]);

  // 주문번호 변경 시 데이터 로드
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

/**
 * 주문 뮤테이션 훅 (생성, 수정, 삭제)
 */
export function useOrderMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createOrder = useCallback(async (orderData: Partial<Order>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await orderApi.createOrder(orderData);
      
      if (response.success && response.data) {
        // 캐시 무효화
        orderCache.invalidate('orders:');
        return response.data;
      } else {
        throw new Error(response.message || '주문 생성에 실패했습니다.');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrder = useCallback(async (id: number, orderData: Partial<Order>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await orderApi.updateOrder(id, orderData);
      
      if (response.success && response.data) {
        // 캐시 무효화
        orderCache.invalidate('orders:');
        orderCache.invalidate('order:');
        return response.data;
      } else {
        throw new Error(response.message || '주문 수정에 실패했습니다.');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOrder = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await orderApi.deleteOrder(id);
      
      if (response.success) {
        // 캐시 무효화
        orderCache.invalidate('orders:');
        orderCache.invalidate('order:');
        return true;
      } else {
        throw new Error(response.message || '주문 삭제에 실패했습니다.');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createOrder,
    updateOrder,
    deleteOrder,
    loading,
    error,
  };
}

/**
 * 주문 통계 훅
 */
export function useOrderStats() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    const cacheKey = 'order-stats';
    
    // 캐시된 데이터 확인 (1분 캐시)
    const cachedData = orderCache.get(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await orderApi.getOrderStats();
      
      if (response.success && response.data) {
        setData(response.data);
        orderCache.set(cacheKey, response.data, 60 * 1000); // 1분 캐시
      } else {
        throw new Error(response.message || '통계 데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    data,
    loading,
    error,
    refetch: fetchStats,
  };
}

// 캐시 유틸리티 함수들
export const orderCacheUtils = {
  /**
   * 전체 캐시 무효화
   */
  invalidateAll: () => {
    orderCache.invalidate();
  },

  /**
   * 특정 패턴의 캐시 무효화
   */
  invalidatePattern: (pattern: string) => {
    orderCache.invalidate(pattern);
  },

  /**
   * 주문 목록 캐시 무효화
   */
  invalidateOrders: () => {
    orderCache.invalidate('orders:');
  },

  /**
   * 특정 주문 캐시 무효화
   */
  invalidateOrder: (orderNumber: string) => {
    orderCache.invalidate(`order:${orderNumber}`);
  },
};