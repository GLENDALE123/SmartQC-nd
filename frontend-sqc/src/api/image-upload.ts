import { apiClient } from './client';

export interface ImageUploadResponse {
  message: string;
  data: {
    id: string;
    fileName: string;
    originalPath: string;
    thumbnailPath: string;
    modalPath: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  };
}

export interface ImageListResponse {
  message: string;
  data: {
    inspectionId: number;
    images: Array<{
      id: string;
      fileName: string;
      originalPath: string;
      thumbnailPath: string;
      modalPath: string;
    }>;
  };
}

export interface ConnectionTestResponse {
  message: string;
  data: {
    status: string;
    timestamp: string;
  };
}

export const imageUploadApi = {
  /**
   * 이미지 업로드
   */
  uploadImage: async (inspectionId: number, file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post(`/image-upload/${inspectionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * 이미지 삭제
   */
  deleteImage: async (inspectionId: number, imageId: string, imageData: { originalPath: string; thumbnailPath: string; modalPath: string }): Promise<{ message: string; data: { id: string } }> => {
    const response = await apiClient.delete(`/image-upload/${inspectionId}/${imageId}`, {
      data: imageData
    });
    return response.data;
  },

  /**
   * 검사별 이미지 목록 조회
   */
  getImagesByInspection: async (inspectionId: number): Promise<ImageListResponse> => {
    const response = await apiClient.get(`/image-upload/${inspectionId}`);
    return response.data;
  },

  /**
   * 공유폴더 연결 테스트
   */
  testConnection: async (): Promise<ConnectionTestResponse> => {
    const response = await apiClient.post('/image-upload/test/connection');
    return response.data;
  },

  /**
   * Attachment를 검사와 연결
   */
  linkAttachmentsToInspection: async (attachmentIds: string[], inspectionId: number, inspectionType: 'incoming' | 'process' | 'shipment'): Promise<{ message: string }> => {
    console.log('[imageUploadApi] linkAttachmentsToInspection 호출됨');
    console.log('[imageUploadApi] attachmentIds:', attachmentIds);
    console.log('[imageUploadApi] inspectionId:', inspectionId);
    console.log('[imageUploadApi] inspectionType:', inspectionType);
    
    const response = await apiClient.post('/image-upload/link-attachments', {
      attachmentIds,
      inspectionId,
      inspectionType
    });
    
    console.log('[imageUploadApi] linkAttachmentsToInspection 응답:', response.data);
    return response.data;
  },
}; 