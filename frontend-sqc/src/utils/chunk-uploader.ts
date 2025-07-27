/**
 * 청크 업로드 유틸리티
 */

export interface ChunkUploadOptions {
  chunkSize?: number;
  maxConcurrentUploads?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface ChunkUploadProgress {
  uploadId: string;
  totalChunks: number;
  completedChunks: number;
  currentChunk: number;
  progress: number;
  message: string;
  error?: string;
}

export interface ChunkUploadResult {
  uploadId: string;
  success: boolean;
  totalChunks: number;
  completedChunks: number;
  results: {
    success: number;
    fail: number;
    created: number;
    updated: number;
    skipped: number;
  };
  error?: string;
}

/**
 * 데이터를 청크로 분할
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * 청크 업로드 클래스
 */
export class ChunkUploader {
  private options: Required<ChunkUploadOptions>;
  private abortController: AbortController | null = null;

  constructor(options: ChunkUploadOptions = {}) {
    this.options = {
      chunkSize: options.chunkSize || 1000,
      maxConcurrentUploads: options.maxConcurrentUploads || 3,
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 1000
    };
  }

  /**
   * 청크 업로드 초기화
   */
  async initUpload(fileName: string, fileSize: number, totalChunks: number): Promise<string> {
    const response = await fetch('/api/upload/optimized/chunk/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName,
        fileSize,
        totalChunks,
        chunkSize: this.options.chunkSize
      })
    });

    if (!response.ok) {
      throw new Error(`청크 업로드 초기화 실패: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data.uploadId;
  }

  /**
   * 단일 청크 업로드
   */
  private async uploadSingleChunk(
    uploadId: string,
    chunkIndex: number,
    totalChunks: number,
    chunkData: any[],
    isLastChunk: boolean,
    attempt: number = 1
  ): Promise<any> {
    try {
      const response = await fetch('/api/upload/optimized/chunk/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uploadId,
          chunkIndex,
          totalChunks,
          chunkData,
          isLastChunk
        }),
        signal: this.abortController?.signal
      });

      if (!response.ok) {
        throw new Error(`청크 ${chunkIndex + 1} 업로드 실패: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      // 재시도 로직
      if (attempt < this.options.retryAttempts && !this.abortController?.signal.aborted) {
        console.warn(`청크 ${chunkIndex + 1} 업로드 실패, ${attempt + 1}번째 재시도 중...`, error);
        
        // 지연 후 재시도
        await new Promise(resolve => setTimeout(resolve, this.options.retryDelay * attempt));
        return this.uploadSingleChunk(uploadId, chunkIndex, totalChunks, chunkData, isLastChunk, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * 청크 배치 업로드 (동시성 제어)
   */
  private async uploadChunkBatch(
    uploadId: string,
    chunks: any[][],
    startIndex: number,
    batchSize: number,
    onProgress: (progress: ChunkUploadProgress) => void
  ): Promise<any[]> {
    const endIndex = Math.min(startIndex + batchSize, chunks.length);
    const batchPromises: Promise<any>[] = [];

    for (let i = startIndex; i < endIndex; i++) {
      const chunkData = chunks[i];
      const isLastChunk = i === chunks.length - 1;
      
      const promise = this.uploadSingleChunk(
        uploadId,
        i,
        chunks.length,
        chunkData,
        isLastChunk
      ).then(result => {
        // 개별 청크 완료 시 진행률 업데이트
        onProgress({
          uploadId,
          totalChunks: chunks.length,
          completedChunks: i + 1,
          currentChunk: i + 1,
          progress: Math.round(((i + 1) / chunks.length) * 100),
          message: `청크 ${i + 1}/${chunks.length} 업로드 완료`
        });
        
        return result;
      });

      batchPromises.push(promise);
    }

    return Promise.all(batchPromises);
  }

  /**
   * 전체 청크 업로드 실행
   */
  async uploadChunks(
    data: any[],
    fileName: string,
    fileSize: number,
    onProgress: (progress: ChunkUploadProgress) => void
  ): Promise<ChunkUploadResult> {
    this.abortController = new AbortController();

    try {
      // 데이터를 청크로 분할
      const chunks = chunkArray(data, this.options.chunkSize);
      
      // 업로드 초기화
      const uploadId = await this.initUpload(fileName, fileSize, chunks.length);

      onProgress({
        uploadId,
        totalChunks: chunks.length,
        completedChunks: 0,
        currentChunk: 0,
        progress: 0,
        message: '청크 업로드 시작...'
      });

      let completedChunks = 0;
      const results: any[] = [];

      // 배치 단위로 청크 업로드
      for (let i = 0; i < chunks.length; i += this.options.maxConcurrentUploads) {
        if (this.abortController.signal.aborted) {
          throw new Error('업로드가 취소되었습니다.');
        }

        const batchResults = await this.uploadChunkBatch(
          uploadId,
          chunks,
          i,
          this.options.maxConcurrentUploads,
          onProgress
        );

        results.push(...batchResults);
        completedChunks += batchResults.length;

        onProgress({
          uploadId,
          totalChunks: chunks.length,
          completedChunks,
          currentChunk: completedChunks,
          progress: Math.round((completedChunks / chunks.length) * 100),
          message: `${completedChunks}/${chunks.length} 청크 업로드 완료`
        });
      }

      // 결과 집계
      const aggregatedResults = results.reduce(
        (acc, result) => {
          const chunkResult = result.data.chunkResult;
          return {
            success: acc.success + chunkResult.success,
            fail: acc.fail + chunkResult.fail,
            created: acc.created + chunkResult.created,
            updated: acc.updated + chunkResult.updated,
            skipped: acc.skipped + chunkResult.skipped
          };
        },
        { success: 0, fail: 0, created: 0, updated: 0, skipped: 0 }
      );

      return {
        uploadId,
        success: true,
        totalChunks: chunks.length,
        completedChunks,
        results: aggregatedResults
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      
      onProgress({
        uploadId: '',
        totalChunks: 0,
        completedChunks: 0,
        currentChunk: 0,
        progress: 0,
        message: '청크 업로드 실패',
        error: errorMessage
      });

      return {
        uploadId: '',
        success: false,
        totalChunks: 0,
        completedChunks: 0,
        results: { success: 0, fail: 0, created: 0, updated: 0, skipped: 0 },
        error: errorMessage
      };
    }
  }

  /**
   * 업로드 취소
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * 최적 청크 크기 계산
   */
  static calculateOptimalChunkSize(dataLength: number): number {
    // 데이터 크기에 따른 동적 청크 크기 결정
    if (dataLength <= 1000) return 500;
    if (dataLength <= 5000) return 1000;
    if (dataLength <= 10000) return 1500;
    if (dataLength <= 50000) return 2000;
    return 2500; // 최대 청크 크기
  }

  /**
   * 최적 동시 업로드 수 계산
   */
  static calculateOptimalConcurrency(totalChunks: number): number {
    if (totalChunks <= 5) return 2;
    if (totalChunks <= 20) return 3;
    if (totalChunks <= 50) return 4;
    return 5; // 최대 동시 업로드 수
  }
}