import { apiClient } from './client';
import { 
  Inspection, 
  InspectionStatus, 
  InspectionType,
  CreateInspectionDto,
  UpdateInspectionDto 
} from '../types';

// 새로운 검사별 DTO 타입들
export interface CreateIncomingInspectionDto {
  orderNumbers: string[];
  client?: string;
  productName?: string;
  partName?: string;
  specification?: string;
  manager?: string;
  inspectionDate: string;
  totalQty: number;
  defectQty: number;
  notes?: string;
  defects: {
    defectTypeId?: number;
    customType?: string;
    count: number;
    details?: any;
  }[];
  attachments?: {
    file: File;
  }[];
}

export interface CreateProcessInspectionDto {
  orderNumbers: string[];
  client?: string;
  productName?: string;
  partName?: string;
  specification?: string;
  manager?: string;
  inspectionDate: string;
  totalQty: number;
  defectQty: number;
  notes?: string;
  paintPrimer?: string;
  paintTopcoat?: string;
  line?: string;
  subLine?: string;
  peelingTest?: string;
  colorDiff?: string;
  extraWork?: string;
  lineSpeed?: string;
  spindleRatio?: string;
  uvCond?: string;
  irCond?: string;
  jig?: string;
  injectionPack?: string;
  afterPack?: string;
  rounds: {
    label: string;
    qty: number;
  }[];
  defects: {
    defectTypeId?: number;
    customType?: string;
    count: number;
    details?: any;
  }[];
  attachments?: {
    file: File;
  }[];
}

export interface CreateShipmentInspectionDto {
  orderNumbers: string[];
  client?: string;
  productName?: string;
  partName?: string;
  specification?: string;
  manager?: string;
  inspectionDate: string;
  totalQty: number;
  defectQty: number;
  notes?: string;
  finalPeeling?: string;
  externalCheck?: boolean;
  rounds: {
    date: string;
    qty: number;
    defectQty: number;
    workers: {
      name: string;
      defects: {
        defectTypeId?: number;
        customType?: string;
        count: number;
        details?: any;
      }[];
    }[];
  }[];
  attachments?: {
    file: File;
  }[];
}

export const inspectionApi = {
  // 기존 API들 (호환성 유지)
  getAll: async (): Promise<Inspection[]> => {
    const res = await apiClient.get<Inspection[]>('/inspections');
    return res.data;
  },

  getById: async (id: number): Promise<Inspection> => {
    const res = await apiClient.get<Inspection>(`/inspections/${id}`);
    return res.data;
  },

  create: async (data: CreateInspectionDto): Promise<Inspection> => {
    const res = await apiClient.post<Inspection>('/inspections', data);
    return res.data;
  },

  update: async (id: number, data: UpdateInspectionDto): Promise<Inspection> => {
    const res = await apiClient.patch<Inspection>(`/inspections/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<void>(`/inspections/${id}`);
  },

  getByStatus: async (status: InspectionStatus): Promise<Inspection[]> => {
    const res = await apiClient.get<Inspection[]>(`/inspections?status=${status}`);
    return res.data;
  },

  getByProductId: async (productId: string): Promise<Inspection[]> => {
    const res = await apiClient.get<Inspection[]>(`/inspections?productId=${productId}`);
    return res.data;
  },

  getByInspectorId: async (inspectorId: number): Promise<Inspection[]> => {
    const res = await apiClient.get<Inspection[]>(`/inspections?inspectorId=${inspectorId}`);
    return res.data;
  },

  // 새로운 검사별 API들
  createIncoming: async (data: CreateIncomingInspectionDto) => {
    const formData = new FormData();
    
    // 기본 데이터를 JSON으로 추가
    const { attachments, ...restData } = data;
    formData.append('data', JSON.stringify(restData));
    
    // 파일들 추가
    if (attachments && attachments.length > 0) {
      attachments.forEach((attachment, index) => {
        formData.append(`attachments`, attachment.file);
      });
    }
    
    const res = await apiClient.post('/incoming-inspections', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  createProcess: async (data: CreateProcessInspectionDto) => {
    const formData = new FormData();
    
    // 기본 데이터를 JSON으로 추가
    const { attachments, ...restData } = data;
    formData.append('data', JSON.stringify(restData));
    
    // 파일들 추가
    if (attachments && attachments.length > 0) {
      attachments.forEach((attachment, index) => {
        formData.append(`attachments`, attachment.file);
      });
    }
    
    const res = await apiClient.post('/process-inspections', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  createShipment: async (data: CreateShipmentInspectionDto) => {
    const formData = new FormData();
    
    // 기본 데이터를 JSON으로 추가
    const { attachments, ...restData } = data;
    formData.append('data', JSON.stringify(restData));
    
    // 파일들 추가
    if (attachments && attachments.length > 0) {
      attachments.forEach((attachment, index) => {
        formData.append(`attachments`, attachment.file);
      });
    }
    
    const res = await apiClient.post('/shipment-inspections', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // orderNumbers 기반 조회 API들
  getIncomingByOrderNumbers: async (orderNumbers: string[]) => {
    const params = new URLSearchParams();
    orderNumbers.forEach(orderNumber => params.append('orderNumbers', orderNumber));
    const res = await apiClient.get(`/incoming-inspections?${params.toString()}`);
    return res.data;
  },

  getProcessByOrderNumbers: async (orderNumbers: string[]) => {
    const params = new URLSearchParams();
    orderNumbers.forEach(orderNumber => params.append('orderNumbers', orderNumber));
    const res = await apiClient.get(`/process-inspections?${params.toString()}`);
    return res.data;
  },

  getShipmentByOrderNumbers: async (orderNumbers: string[]) => {
    const params = new URLSearchParams();
    orderNumbers.forEach(orderNumber => params.append('orderNumbers', orderNumber));
    const res = await apiClient.get(`/shipment-inspections?${params.toString()}`);
    return res.data;
  },

  // ID 기반 업데이트 API들
  updateIncomingById: async (id: number, data: CreateIncomingInspectionDto) => {
    const res = await apiClient.patch(`/incoming-inspections/${id}`, data);
    return res.data;
  },

  updateProcessById: async (id: number, data: CreateProcessInspectionDto) => {
    const res = await apiClient.patch(`/process-inspections/${id}`, data);
    return res.data;
  },

  updateShipmentById: async (id: number, data: CreateShipmentInspectionDto) => {
    const res = await apiClient.patch(`/shipment-inspections/${id}`, data);
    return res.data;
  },

  // ID 기반 조회 API들
  getIncomingById: async (id: number) => {
    const res = await apiClient.get(`/incoming-inspections/${id}`);
    return res.data;
  },

  getProcessById: async (id: number) => {
    const res = await apiClient.get(`/process-inspections/${id}`);
    return res.data;
  },

  getShipmentById: async (id: number) => {
    const res = await apiClient.get(`/shipment-inspections/${id}`);
    return res.data;
  },

  // 삭제 API들
  deleteIncoming: async (id: number) => {
    await apiClient.delete(`/incoming-inspections/${id}`);
  },

  deleteProcess: async (id: number) => {
    await apiClient.delete(`/process-inspections/${id}`);
  },

  deleteShipment: async (id: number) => {
    await apiClient.delete(`/shipment-inspections/${id}`);
  },

  /**
   * 최근 검사 기록 조회 (필터링 옵션 포함)
   */
  getRecentInspections: async (filters?: {
    orderNumber?: string;
    productName?: string;
    partName?: string;
    type?: 'incoming' | 'process' | 'shipment';
    limit?: number;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    
    if (filters?.orderNumber) params.append('orderNumber', filters.orderNumber);
    if (filters?.productName) params.append('productName', filters.productName);
    if (filters?.partName) params.append('partName', filters.partName);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    
    const response = await apiClient.get(`/inspections/recent?${params.toString()}`);
    return response.data;
  },

  /**
   * 검사 상세 조회 (통합)
   */
  getInspectionDetail: async (id: number, type: 'incoming' | 'process' | 'shipment') => {
    const response = await apiClient.get(`/inspections/${id}?type=${type}`);
    return response.data;
  },

  /**
   * 검사 참고 이력 조회
   */
  getInspectionReferences: async (params: {
    orderNumbers?: string[];
    orderNumber?: string;
    productName?: string;
    partName?: string;
    client?: string;
    inspectionType: 'incoming' | 'process' | 'shipment';
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params.orderNumbers && params.orderNumbers.length > 0) {
      searchParams.append('orderNumbers', params.orderNumbers.join(','));
    }
    if (params.orderNumber) searchParams.append('orderNumber', params.orderNumber);
    if (params.productName) searchParams.append('productName', params.productName);
    if (params.partName) searchParams.append('partName', params.partName);
    if (params.client) searchParams.append('client', params.client);
    searchParams.append('inspectionType', params.inspectionType);
    
    const response = await apiClient.get(`/inspections/references?${searchParams.toString()}`);
    return response.data;
  },
};