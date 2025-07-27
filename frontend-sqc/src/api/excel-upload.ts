import { apiClient } from './client';

export interface UploadResult {
  totalRows: number;
  results: {
    success: number;
    failed: number;
    duplicate: number;
    updated: number;
    errors: string[];
  };
}

export interface UploadProgress {
  uploadId: string;
  stage: 'parsing' | 'validating' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  processedRows?: number;
  totalRows?: number;
  currentBatch?: number;
  totalBatches?: number;
  processedChunks?: number;
  totalChunks?: number;
  details?: {
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
}

export interface OptimizedUploadResult {
  uploadId: string;
  message: string;
}

export interface ValidationSummary {
  total: number;
  valid: number;
  invalid: number;
  errors: string[];
}

export interface ExcelUploadResponse {
  message: string;
  data: {
    uploadId: string;
    fileName: string;
    fileSize: number;
    totalRows: number;
    processedRows: number;
    status: 'processing' | 'completed' | 'failed';
    uploadedAt: string;
    results: {
      success: number;
      failed: number;
      duplicate?: number;
      updated?: number;
      errors: Array<{
        row: number;
        error: string;
        data?: any;
      }>;
      created: any[];
    };
  };
}

export interface ExcelProgressResponse {
  message: string;
  data: {
    uploadId: string;
    status: 'processing' | 'completed' | 'failed';
    progress: number; // 0-100
    totalRows: number;
    processedRows: number;
    errorCount: number;
    errors?: Array<{
      row: number;
      message: string;
    }>;
  };
}

export interface ExcelUploadError {
  message: string;
  error: {
    code: string;
    details?: string;
  };
}

// 기존 엑셀 업로드 함수
export const uploadExcel = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/upload/excel-orders', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

// 최적화된 엑셀 업로드 함수
export const uploadOptimizedExcel = async (
  file: File, 
  preProcessedData?: any[], 
  validationSummary?: ValidationSummary
): Promise<OptimizedUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (preProcessedData) {
    formData.append('preProcessedData', JSON.stringify(preProcessedData));
  }
  
  if (validationSummary) {
    formData.append('validationSummary', JSON.stringify(validationSummary));
  }

  const response = await apiClient.post('/upload/optimized/excel-orders', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

// 업로드 진행률 조회 (SSE 대신 폴링용)
export const getUploadProgress = async (uploadId: string): Promise<UploadProgress> => {
  const response = await apiClient.get(`/upload/optimized/progress/${uploadId}`);
  return response.data.data;
};

// 활성 업로드 목록 조회
export const getActiveUploads = async (): Promise<UploadProgress[]> => {
  const response = await apiClient.get('/upload/optimized/active');
  return response.data.data;
};

// 업로드 취소
export const cancelUpload = async (uploadId: string): Promise<void> => {
  await apiClient.delete(`/upload/optimized/${uploadId}`);
};

// 기존 함수들 유지
export const getProgress = async () => {
  const response = await apiClient.get('/upload/progress');
  return response.data;
};

export const getUploadHistory = async () => {
  const response = await apiClient.get('/upload/history');
  return response.data;
};

// 기존 객체 형태도 유지 (하위 호환성)
export const excelUploadApi = {
  uploadExcel,
  getProgress,
  cancelUpload,
  getUploadHistory,
};