import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as XLSX from 'xlsx';
// import { QualityHistoryService } from '../services/quality-history.service';
import { UploadLogService } from '../services/upload-log.service';
import { OrderService } from '../services/order.service';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
// import { excelUploadProgressMap } from '../services/excel-order.service';

@ApiTags('엑셀 업로드')
@Controller('upload')
export class UploadController {
  constructor(
    // private readonly qualityHistoryService: QualityHistoryService,
    private readonly uploadLogService: UploadLogService,
    private readonly orderService: OrderService,
  ) {}

  @Post('excel-orders')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // 메모리 저장소로 변경
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
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
    }),
  )
  @ApiOperation({ summary: '엑셀 파일로 발주(orders) 데이터 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: '엑셀 데이터 업로드 성공' })
  @ApiResponse({ status: 400, description: '엑셀 파일만 업로드 가능' })
  async uploadExcelOrders(
    @UploadedFile() file: Express.Multer.File,
    @Req() req?: any,
  ) {
    if (!file) {
      throw new HttpException(
        '파일이 첨부되지 않았습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // 엑셀 파일 파싱
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });

      // 2번째 시트 확인
      if (workbook.SheetNames.length < 2) {
        throw new HttpException(
          '엑셀 파일에 2번째 시트가 없습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const sheetName = workbook.SheetNames[1]; // 2번째 시트
      const sheet = workbook.Sheets[sheetName];

      // 5번째 행부터 데이터 읽기 (헤더는 4번째 행)
      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        range: 3, // 5번째 행부터 (0-based index)
        defval: null,
        raw: false, // 문자열로 변환
      });

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new HttpException(
          '엑셀 파일에서 유효한 데이터를 찾을 수 없습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 엑셀 데이터를 Order 모델에 맞게 변환
      const transformedData = jsonData.map((row: any, index: number) => {
        // 숫자 파싱 헬퍼 함수 (쉼표 제거 및 공백 정리)
        const parseNumber = (value: any): number | null => {
          if (value === null || value === undefined || value === '')
            return null;
          const cleanValue = String(value).replace(/,/g, '').trim();
          const parsed = parseInt(cleanValue);
          return isNaN(parsed) ? null : parsed;
        };

        // 엑셀 컬럼을 Order 모델 필드에 매핑
        const transformed = {
          col0: index + 1, // 고유 ID (임시로 순번 사용)
          year: parseNumber(row['년']),
          month: parseNumber(row['월']),
          day: parseNumber(row['일']),
          category: row['분류'] || null,
          finalorderNumber: row['열1'] || null,
          orderNumber: row['발주번호'] || null,
          code: row['코드'] || null,
          registration: row['등록번호'] || null,
          col2: row['열2'] || null,
          customer: row['발 주 처'] || null,
          productName: row['제 품 명'] || null,
          partName: row['부속명'] || null,
          quantity: parseNumber(row[' 발주수량 ']),
          specification: row['사양'] || null,
          postProcess: row['후공정'] || null,
          production: parseNumber(row['생산']),
          remaining: parseNumber(row['잔여']),
          status: row['진행'] || null,
          sample: row['견본'] || null,
          shippingDate: row['출하일'] || null,
          dDay: row['D-DAY'] || null,
          manager: row['담당'] || null,
          shipping: row['출하'] || null,
          jig: row['지그'] || null,
          registration2: row['등록'] || null,
          category2: row['구분'] || null,
          unitPrice: parseNumber(row['단가']),
          orderAmount: parseNumber(row['발주금액']),
          etc: row['기타'] || null,
          category3: row['구분2'] || null,
          salesManager: row['매출담당'] || null,
        };

        return transformed;
      });

      // OrderService의 bulkCreateOrders 메서드 호출
      const result = await this.orderService.bulkCreateOrders(transformedData);

      // 업로드 이력 저장
      await this.uploadLogService.createLog({
        userId: req?.user?.id || null,
        fileName: file.originalname,
        successCount: result.success,
        failedCount: result.fail,
        results: {
          total: jsonData.length,
          success: result.success,
          failed: result.fail,
          details: result.details,
          created: result.created.length,
        },
      });

      // 결과 반환
      return {
        message: `엑셀 데이터 업로드 완료: 성공 ${result.success}건 (생성: ${result.details.created}, 업데이트: ${result.details.updated}, 중복: ${result.details.skipped}), 실패 ${result.fail}건`,
        data: {
          uploadId: `upload_${Date.now()}`,
          fileName: file.originalname,
          fileSize: file.size,
          totalRows: jsonData.length,
          processedRows: result.success,
          status: result.success > 0 ? 'completed' : 'failed',
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
      // 업로드 실패 이력 저장
      await this.uploadLogService.createLog({
        userId: req?.user?.id || null,
        fileName: file.originalname,
        successCount: 0,
        failedCount: 1,
        results: {
          error: err.message || '알 수 없는 오류',
          timestamp: new Date().toISOString(),
        },
      });

      throw new HttpException(
        `엑셀 파일 처리에 실패했습니다: ${err?.message ?? err}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('orders/by-final-order-number/:finalorderNumber')
  async getOrderByFinalOrderNumber(
    @Param('finalorderNumber') finalorderNumber: string,
  ) {
    return this.orderService.findByOrderNumber(finalorderNumber);
  }

  @Get('excel-orders/progress')
  async sseExcelOrdersProgress(
    @Param() params: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // authToken을 쿼리에서 추출 (실제 서비스에서는 JWT 검증 필요)
    const userId = req.query.authToken as string;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();

    // 임시로 완료된 상태로 응답
    const progress = { progress: 1, total: 1 };
    res.write(`data: ${JSON.stringify(progress)}\n\n`);
    res.end();
  }
}
