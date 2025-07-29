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
        data?: Record<string, unknown>;
      }>;
      created: Record<string, unknown>[];
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

// 기본 엑셀 업로드 함수
export const uploadExcel = async (file: File, onProgress?: (progress: number) => void): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/upload/excel-orders', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 120000, // 엑셀 업로드는 2분 타임아웃 (대용량 파일 처리 고려)
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  return response.data.data;
};

// 기본 함수들
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
  getUploadHistory,
};