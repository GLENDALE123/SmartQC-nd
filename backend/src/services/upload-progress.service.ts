import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface UploadProgress {
  uploadId: string;
  stage: 'parsing' | 'validating' | 'processing' | 'completed' | 'error';
  progress: number; // 0-100
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

@Injectable()
export class UploadProgressService {
  private progressSubjects = new Map<string, Subject<UploadProgress>>();

  /**
   * 새로운 업로드 진행률 스트림 생성
   */
  createProgressStream(uploadId: string): Observable<UploadProgress> {
    const subject = new Subject<UploadProgress>();
    this.progressSubjects.set(uploadId, subject);
    return subject.asObservable();
  }

  /**
   * 업로드 진행률 초기화
   */
  initProgress(uploadId: string, initialProgress: UploadProgress): void {
    const subject = new Subject<UploadProgress>();
    this.progressSubjects.set(uploadId, subject);
    subject.next(initialProgress);
  }

  /**
   * 진행률 업데이트
   */
  updateProgress(uploadId: string, progress: UploadProgress): void {
    const subject = this.progressSubjects.get(uploadId);
    if (subject) {
      subject.next(progress);
    }
  }

  /**
   * 진행률 스트림 완료
   */
  completeProgress(uploadId: string): void {
    const subject = this.progressSubjects.get(uploadId);
    if (subject) {
      subject.complete();
      this.progressSubjects.delete(uploadId);
    }
  }

  /**
   * 진행률 스트림 에러 처리
   */
  errorProgress(uploadId: string, error: any): void {
    const subject = this.progressSubjects.get(uploadId);
    if (subject) {
      subject.error(error);
      this.progressSubjects.delete(uploadId);
    }
  }

  /**
   * 특정 업로드의 진행률 스트림 가져오기
   */
  getProgressStream(uploadId: string): Observable<UploadProgress> | null {
    const subject = this.progressSubjects.get(uploadId);
    return subject ? subject.asObservable() : null;
  }

  /**
   * 모든 활성 업로드 ID 목록
   */
  getActiveUploads(): string[] {
    return Array.from(this.progressSubjects.keys());
  }

  /**
   * 업로드 취소
   */
  cancelUpload(uploadId: string): void {
    const subject = this.progressSubjects.get(uploadId);
    if (subject) {
      this.updateProgress(uploadId, {
        uploadId,
        stage: 'error',
        progress: 0,
        message: '업로드가 취소되었습니다.'
      });
      subject.complete();
      this.progressSubjects.delete(uploadId);
    }
  }
}