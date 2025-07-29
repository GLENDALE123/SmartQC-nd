import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api/orders';

export interface FilterOptions {
  status: string[];
  customer: string[];
  productName: string[];
  partName: string[];
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ['filter-options'],
    queryFn: async (): Promise<FilterOptions> => {
      const response = await orderApi.getFilterOptions();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
    refetchOnWindowFocus: false,
    retry: 2,
  });
}