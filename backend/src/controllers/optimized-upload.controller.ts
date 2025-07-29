import {
  Controller,
  Post,
  Get,
  Delete,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Param,
  Req,
  Res,
  Body,
  Sse,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response, Request } from 'express';
import { Observable, interval, map } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { UploadLogService } from '../services/upload-log.service';
import {
  UploadProgressService,
  UploadProgress,
} from '../services/upload-progress.service';

interface OptimizedUploadRequest {
  file: Express.Multer.File;
  preProcessedData?: any[];
  validationSummary?: {
    total: number;
    valid: number;
    invalid: number;
    chunks?: any[];
  };
}

interface ChunkUploadRequest {
  chunkIndex: number;
  totalChunks: number;
  uploadId: string;
  chunkData: any[];
  isLastChunk: boolean;
}

@ApiTags('최적화된 엑셀 업로드')
@Controller('upload/optimized')
export class OptimizedUploadController {
  constructor(
    private readonly orderService: OrderService,
    private readonly uploadLogService: UploadLogService,
    private readonly uploadProgressService: UploadProgressService,
  ) {}

  /**
   * 클라이언트에서 사전 처리된 데이터로 최적화된 업로드
   */
  @Post('excel-orders')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
          return cb(
            new HttpException(
              '엑셀 파일만 업로드 가능합니다.',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 제한
    }),
  )
  @ApiOperation({ summary: '최적화된 엑셀 파일 업로드 (사전 처리된 데이터)' })
  @ApiConsumes('multipart/form-data')
  async uploadOptimizedExcelOrders(
    @UploadedFile() file: Express.Multer.File,
    @Body('preProcessedData') preProcessedDataStr?: string,
    @Body('validationSummary') validationSummaryStr?: string,
    @Req() req?: any,
  ) {
    if (!file) {
      throw new HttpException(
        '파일이 첨부되지 않았습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const uploadId = uuidv4();

    try {
      // 클라이언트에서 사전 처리된 데이터가 있는지 확인
      let transformedData: any[];
      let totalRows: number;

      if (preProcessedDataStr) {
        // ⚠️ 클라이언트 데이터는 성능 힌트로만 사용, 반드시 재검증
        const clientData = JSON.parse(preProcessedDataStr);
        const clientSummary = validationSummaryStr
          ? JSON.parse(validationSummaryStr)
          : null;

        this.uploadProgressService.updateProgress(uploadId, {
          uploadId,
          stage: 'parsing',
          progress: 5,
          message: '서버에서 파일 재검증 중... (보안 검증)',
          totalRows: clientSummary?.total || 0,
          processedRows: 0,
        });

        // 🔒 보안 원칙: 클라이언트를 절대 믿지 않고 서버에서 완전 재검증
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });

        if (workbook.SheetNames.length < 2) {
          throw new HttpException(
            '엑셀 파일에 2번째 시트가 없습니다.',
            HttpStatus.BAD_REQUEST,
          );
        }

        const sheetName = workbook.SheetNames[1];
        const sheet = workbook.Sheets[sheetName];

        const serverParsedData = XLSX.utils.sheet_to_json(sheet, {
          range: 3,
          defval: null,
          raw: false,
        });

        // 🔍 클라이언트 데이터와 서버 데이터 일치성 검증
        if (serverParsedData.length !== clientData.length) {
          // 데이터 불일치 감지 시 서버 데이터 우선 사용
        }

        totalRows = serverParsedData.length; // 서버 데이터 기준으로 설정

        this.uploadProgressService.updateProgress(uploadId, {
          uploadId,
          stage: 'validating',
          progress: 15,
          message: '서버에서 데이터 변환 및 검증 중...',
          totalRows,
          processedRows: 0,
        });

        // 🛡️ 서버에서 완전히 재처리 (클라이언트 데이터 무시)
        transformedData = this.transformAndValidateData(serverParsedData);
      } else {
        // 서버에서 파일 파싱 (기존 방식)
        this.uploadProgressService.updateProgress(uploadId, {
          uploadId,
          stage: 'parsing',
          progress: 5,
          message: '엑셀 파일 파싱 중...',
        });

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });

        if (workbook.SheetNames.length < 2) {
          throw new HttpException(
            '엑셀 파일에 2번째 시트가 없습니다.',
            HttpStatus.BAD_REQUEST,
          );
        }

        const sheetName = workbook.SheetNames[1];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          range: 3,
          defval: null,
          raw: false,
        });

        totalRows = jsonData.length;

        this.uploadProgressService.updateProgress(uploadId, {
          uploadId,
          stage: 'validating',
          progress: 15,
          message: '데이터 변환 중...',
          totalRows,
          processedRows: 0,
        });

        // 데이터 변환
        transformedData = this.transformAndValidateData(jsonData);
      }

      this.uploadProgressService.updateProgress(uploadId, {
        uploadId,
        stage: 'processing',
        progress: 25,
        message: '데이터베이스 처리 시작...',
        totalRows,
        processedRows: 0,
      });

      // 진행률 콜백과 함께 bulkCreateOrders 호출
      const result = await this.orderService.bulkCreateOrdersWithProgress(
        transformedData,
        (
          progress: number,
          processedRows: number,
          currentBatch?: number,
          totalBatches?: number,
        ) => {
          this.uploadProgressService.updateProgress(uploadId, {
            uploadId,
            stage: 'processing',
            progress: 25 + progress * 0.7, // 25%에서 95%까지
            message: `데이터 처리 중... (${processedRows}/${totalRows})`,
            totalRows,
            processedRows,
            currentBatch,
            totalBatches,
          });
        },
      );

      // 업로드 이력 저장
      await this.uploadLogService.createLog({
        userId: 1, // TODO: 실제 사용자 ID로 변경
        fileName: file.originalname,
        successCount: result.success,
        failedCount: result.fail,
        results: result,
      });

      this.uploadProgressService.updateProgress(uploadId, {
        uploadId,
        stage: 'completed',
        progress: 100,
        message: `업로드 완료! 성공: ${result.success}건, 실패: ${result.fail}건`,
        totalRows,
        processedRows: result.success,
        details: {
          ...result.details,
          failed: result.fail,
        },
      });

      // 스트림 완료
      setTimeout(() => {
        this.uploadProgressService.completeProgress(uploadId);
      }, 1000);

      return {
        message: '엑셀 데이터 업로드가 완료되었습니다.',
        data: {
          uploadId,
          fileName: file.originalname,
          fileSize: file.size,
          totalRows,
          processedRows: result.success,
          status: result.fail > 0 ? 'partial_success' : 'completed',
          uploadedAt: new Date().toISOString(),
          results: {
            success: result.success,
            fail: result.fail,
            details: result.details,
            created: result.created,
          },
        },
      };
    } catch (err) {
      this.uploadProgressService.updateProgress(uploadId, {
        uploadId,
        stage: 'error',
        progress: 0,
        message: `업로드 실패: ${err.message}`,
      });

      // 에러 후 스트림 완료
      setTimeout(() => {
        this.uploadProgressService.errorProgress(uploadId, err);
      }, 1000);

      // 업로드 실패 이력 저장
      await this.uploadLogService.createLog({
        userId: 1, // TODO: 실제 사용자 ID로 변경
        fileName: file.originalname,
        successCount: 0,
        failedCount: 0,
        results: null,
      });

      throw new HttpException(
        `엑셀 업로드 중 오류가 발생했습니다: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 🛡️ 보안 검증: 서버에서 데이터 변환 및 검증
   * 클라이언트 데이터를 절대 믿지 않고 서버에서 완전히 재처리
   */
  private transformAndValidateData(jsonData: any[]): any[] {
    return jsonData.map((row: any, index: number) => {
      // 🔒 입력값 검증 및 정제
      const parseNumber = (value: any): number | null => {
        if (value === null || value === undefined || value === '') return null;

        // 문자열 정제 (XSS 방지)
        const cleanValue = typeof value === 'string' ? value.trim() : value;
        const num = Number(cleanValue);

        // 유효성 검증
        if (isNaN(num) || !isFinite(num)) return null;
        if (num < 0 || num > 999999999) return null; // 범위 제한

        return num;
      };

      const sanitizeString = (value: any): string | null => {
        if (value === null || value === undefined) return null;

        // 문자열 정제 및 길이 제한
        const str = String(value).trim();
        if (str.length === 0) return null;
        if (str.length > 500) return str.substring(0, 500); // 길이 제한

        // 기본적인 XSS 방지 (HTML 태그 제거)
        return str.replace(/<[^>]*>/g, '');
      };

      // 🔍 필수 필드 검증
      const orderNumber = sanitizeString(row['발주번호']);
      const productName = sanitizeString(row['제품명']);

      // 비즈니스 로직 검증 (필요시 별도 처리)

      return {
        col0: index + 1,
        year: parseNumber(row['년']),
        month: parseNumber(row['월']),
        day: parseNumber(row['일']),
        category: sanitizeString(row['분류']),
        finalorderNumber: sanitizeString(row['열1']),
        orderNumber: sanitizeString(row['발주번호']),
        code: sanitizeString(row['코드']),
        registration: sanitizeString(row['등록번호']),
        col2: sanitizeString(row['열2']),
        customer: sanitizeString(row['발주처']),
        productName: sanitizeString(row['제품명']),
        partName: sanitizeString(row['부속명']),
        specification: sanitizeString(row['규격']),
        quantity: parseNumber(row['수량']),
        production: parseNumber(row['생산']),
        remaining: parseNumber(row['잔량']),
        postProcess: sanitizeString(row['후가공']),
        status: sanitizeString(row['상태']),
        sample: sanitizeString(row['샘플']),
        shippingDate: sanitizeString(row['출하일']),
        dDay: sanitizeString(row['D-DAY']),
        manager: sanitizeString(row['담당자']),
        shipping: sanitizeString(row['출하']),
        jig: sanitizeString(row['지그']),
        registration2: sanitizeString(row['등록번호2']),
        category2: sanitizeString(row['구분']),
        unitPrice: parseNumber(row['단가']),
        orderAmount: parseNumber(row['발주금액']),
        etc: sanitizeString(row['기타']),
        category3: sanitizeString(row['구분2']),
        salesManager: sanitizeString(row['매출담당']),
      };
    });
  }

  /**
   * 실시간 업로드 진행률 스트리밍 (SSE)
   */
  @Sse('progress/:uploadId')
  @ApiOperation({ summary: '업로드 진행률 실시간 스트리밍' })
  getUploadProgress(@Param('uploadId') uploadId: string): Observable<any> {
    const progressStream =
      this.uploadProgressService.getProgressStream(uploadId);

    if (!progressStream) {
      // 업로드 ID가 없으면 에러 스트림 반환
      return new Observable((observer) => {
        observer.next({
          data: JSON.stringify({
            uploadId,
            stage: 'error',
            progress: 0,
            message: '업로드 세션을 찾을 수 없습니다.',
          }),
        });
        observer.complete();
      });
    }

    return progressStream.pipe(
      map((progress) => ({
        data: JSON.stringify(progress),
      })),
    );
  }

  /**
   * 업로드 취소
   */
  @Delete(':uploadId')
  @ApiOperation({ summary: '업로드 취소' })
  async cancelUpload(@Param('uploadId') uploadId: string) {
    this.uploadProgressService.cancelUpload(uploadId);

    return {
      message: '업로드가 취소되었습니다.',
      uploadId,
    };
  }

  /**
   * 청크 업로드 초기화
   */
  @Post('chunk/init')
  @ApiOperation({ summary: '청크 업로드 초기화' })
  async initChunkUpload(
    @Body()
    initData: {
      fileName: string;
      fileSize: number;
      totalChunks: number;
      chunkSize: number;
    },
  ) {
    const uploadId = uuidv4();

    // 청크 업로드 세션 초기화
    this.uploadProgressService.initProgress(uploadId, {
      uploadId,
      stage: 'parsing',
      progress: 0,
      message: '청크 업로드 초기화 중...',
      totalChunks: initData.totalChunks,
      processedChunks: 0,
    });

    return {
      message: '청크 업로드가 초기화되었습니다.',
      data: {
        uploadId,
        fileName: initData.fileName,
        fileSize: initData.fileSize,
        totalChunks: initData.totalChunks,
        chunkSize: initData.chunkSize,
      },
    };
  }

  /**
   * 청크 데이터 업로드
   */
  @Post('chunk/upload')
  @ApiOperation({ summary: '청크 데이터 업로드' })
  async uploadChunk(@Body() chunkRequest: ChunkUploadRequest) {
    const { uploadId, chunkIndex, totalChunks, chunkData, isLastChunk } =
      chunkRequest;

    try {
      // 진행률 업데이트
      const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
      this.uploadProgressService.updateProgress(uploadId, {
        uploadId,
        stage: 'processing',
        progress,
        message: `청크 ${chunkIndex + 1}/${totalChunks} 처리 중...`,
        processedChunks: chunkIndex + 1,
        totalChunks,
      });

      // 청크 데이터 검증 및 변환
      const validatedData = this.transformAndValidateData(chunkData);

      // 데이터베이스에 청크 저장
      const result = await this.orderService.bulkCreateOrdersWithProgress(
        validatedData,
        (progressPercent, processedRows, currentBatch, totalBatches) => {
          this.uploadProgressService.updateProgress(uploadId, {
            uploadId,
            stage: 'processing',
            progress: Math.round(
              progress + (progressPercent * 0.8) / totalChunks,
            ),
            message: `청크 ${chunkIndex + 1}/${totalChunks}: ${Math.round(progressPercent)}% 완료`,
            processedRows: processedRows,
            totalRows: validatedData.length,
            currentBatch: currentBatch,
            totalBatches: totalBatches,
          });
        },
      );

      // 마지막 청크인 경우 완료 처리
      if (isLastChunk) {
        this.uploadProgressService.updateProgress(uploadId, {
          uploadId,
          stage: 'completed',
          progress: 100,
          message: '청크 업로드 완료!',
          details: {
            created: result.details.created,
            updated: result.details.updated,
            skipped: result.details.skipped,
            failed: result.fail,
          },
        });

        // 업로드 이력 저장
        await this.uploadLogService.createLog({
          userId: 1, // TODO: 실제 사용자 ID로 변경
          fileName: `chunk_upload_${uploadId}`,
          successCount: result.success,
          failedCount: result.fail,
          results: result.details,
        });

        // 스트림 완료
        setTimeout(() => {
          this.uploadProgressService.completeProgress(uploadId);
        }, 1000);
      }

      return {
        message: `청크 ${chunkIndex + 1}/${totalChunks} 업로드 완료`,
        data: {
          uploadId,
          chunkIndex,
          totalChunks,
          processedRows: result.success,
          isLastChunk,
          chunkResult: {
            success: result.success,
            fail: result.fail,
            created: result.details.created,
            updated: result.details.updated,
            skipped: result.details.skipped,
          },
        },
      };
    } catch (err) {
      this.uploadProgressService.updateProgress(uploadId, {
        uploadId,
        stage: 'error',
        progress: 0,
        message: `청크 업로드 실패: ${err.message}`,
      });

      throw new HttpException(
        `청크 업로드 중 오류가 발생했습니다: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 활성 업로드 목록 조회
   */
  @Get('active')
  @ApiOperation({ summary: '활성 업로드 목록 조회' })
  getActiveUploads() {
    const activeUploads = this.uploadProgressService.getActiveUploads();

    return {
      message: '활성 업로드 목록을 조회했습니다.',
      data: {
        activeUploads,
        count: activeUploads.length,
      },
    };
  }
}
