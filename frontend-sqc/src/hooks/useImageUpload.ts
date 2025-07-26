import { useState, useCallback } from 'react';
import { imageUploadApi, ImageUploadResponse } from '../api/image-upload';

export interface UploadedImage {
  id: string;
  fileName: string;
  originalPath: string;
  thumbnailPath: string;
  modalPath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

// 파일명 정제 함수: 한글, 영문, 숫자, 언더스코어, 하이픈, 점만 허용
function sanitizeFileName(name: string) {
  return name.replace(/[^ㄱ-ㅎ가-힣a-zA-Z0-9._-]/g, '_');
}

// 간단한 파일명 생성 함수
function generateFileName(originalFileName: string): string {
  const timestamp = Date.now();
  const extension = originalFileName.split('.').pop() || 'jpg';
  const sanitizedName = sanitizeFileName(originalFileName.replace(`.${extension}`, ''));
  return `${sanitizedName}_${timestamp}.${extension}`;
}

export const useImageUpload = (inspectionId: number, readOnly: boolean = false) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [tempImages, setTempImages] = useState<File[]>([]);
  const [tempPreviewUrls, setTempPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * 임시 이미지 추가 (읽기 전용 모드에서는 비활성화)
   */
  const addTempImage = useCallback((file: File) => {
    if (readOnly) {
      alert("읽기 전용 모드에서는 이미지를 추가할 수 없습니다.");
      return;
    }

    if (!file) return;

    // 파일 검증
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      alert("JPEG, PNG, WebP 형식만 업로드 가능합니다.");
      return;
    }

    // 임시 이미지에 추가
    setTempImages(prev => [...prev, file]);
    setTempPreviewUrls(prev => [...prev, URL.createObjectURL(file)]);

    console.log(`${file.name} 파일이 임시로 추가되었습니다.`);
  }, [readOnly]);

  /**
   * 임시 이미지 삭제 (읽기 전용 모드에서는 비활성화)
   */
  const removeTempImage = useCallback((index: number) => {
    if (readOnly) {
      alert("읽기 전용 모드에서는 이미지를 삭제할 수 없습니다.");
      return;
    }

    setTempImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      return newImages;
    });
    setTempPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      return newUrls;
    });
  }, [readOnly]);

  /**
   * 모든 임시 이미지 업로드 (읽기 전용 모드에서는 비활성화)
   */
  const uploadAllTempImages = useCallback(async (): Promise<UploadedImage[]> => {
    if (readOnly) {
      alert("읽기 전용 모드에서는 이미지를 업로드할 수 없습니다.");
      return [];
    }

    if (tempImages.length === 0) return [];

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = tempImages.length;
      let uploadedCount = 0;
      const uploadedResults: UploadedImage[] = [];

      for (const file of tempImages) {
        try {
          // 파일명 생성
          const safeName = generateFileName(file.name);
          const safeFile = new File([file], safeName, { type: file.type });
          
          const response: ImageUploadResponse = await imageUploadApi.uploadImage(inspectionId, safeFile);
          uploadedResults.push(response.data);
          uploadedCount++;
          
          // 진행률 업데이트
          setUploadProgress((uploadedCount / totalFiles) * 100);
        } catch (error: any) {
          console.error(`파일 ${file.name} 업로드 실패:`, error);
          alert(`${file.name} 파일 업로드에 실패했습니다.`);
          throw error;
        }
      }

      // 업로드된 이미지들을 상태에 추가
      setUploadedImages(prev => [...prev, ...uploadedResults]);

      // 임시 이미지 초기화
      setTempImages([]);
      setTempPreviewUrls([]);

      if (uploadedCount > 0) {
        console.log(`${uploadedCount}개 파일이 성공적으로 업로드되었습니다.`);
      }

      return uploadedResults;

    } catch (error: any) {
      alert(error.message || "이미지 업로드 중 오류가 발생했습니다.");
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [inspectionId, tempImages, readOnly]);

  /**
   * 이미지 삭제 (읽기 전용 모드에서는 비활성화)
   */
  const deleteImage = useCallback(async (imageId: string, imageData: { originalPath: string; thumbnailPath: string; modalPath: string }) => {
    if (readOnly) {
      alert("읽기 전용 모드에서는 이미지를 삭제할 수 없습니다.");
      return;
    }

    try {
      await imageUploadApi.deleteImage(inspectionId, imageId, imageData);
      
      // 업로드된 이미지 목록에서 제거
      setUploadedImages(prev => prev.filter(img => img.id !== imageId));

      console.log("이미지가 성공적으로 삭제되었습니다.");

    } catch (error: any) {
      alert(error.message || "이미지 삭제 중 오류가 발생했습니다.");
      throw error;
    }
  }, [inspectionId, readOnly]);

  /**
   * 이미지 목록 조회
   */
  const loadImages = useCallback(async () => {
    try {
      console.log('[useImageUpload] loadImages 호출됨 - inspectionId:', inspectionId);
      
      const response = await imageUploadApi.getImagesByInspection(inspectionId);
      console.log('[useImageUpload] API 응답:', response);
      
      // 실제 이미지 데이터로 변환
      const images: UploadedImage[] = response.data.images.map((img) => ({
        id: img.id,
        fileName: img.fileName,
        originalPath: img.originalPath,
        thumbnailPath: img.thumbnailPath,
        modalPath: img.modalPath,
        fileSize: 0,
        mimeType: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
      }));

      console.log('[useImageUpload] 변환된 이미지 데이터:', images);
      setUploadedImages(images);

    } catch (error: any) {
      console.error('[useImageUpload] 이미지 목록 조회 실패:', error);
    }
  }, [inspectionId]);

  /**
   * 연결 테스트
   */
  const testConnection = useCallback(async () => {
    try {
      const response = await imageUploadApi.testConnection();
      
      console.log("공유폴더에 성공적으로 연결되었습니다.");
      return response.data;

    } catch (error: any) {
      alert(error.message || "공유폴더 연결에 실패했습니다.");
      throw error;
    }
  }, []);

  return {
    uploadedImages,
    setUploadedImages,
    tempImages,
    tempPreviewUrls,
    isUploading,
    uploadProgress,
    addTempImage,
    removeTempImage,
    uploadAllTempImages,
    deleteImage,
    loadImages,
    testConnection,
  };
}; 