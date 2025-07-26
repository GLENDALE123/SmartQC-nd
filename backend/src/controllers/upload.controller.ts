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
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
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
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(), // 메모리 저장소로 변경
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(xlsx|xls)$/)) {
        return cb(new HttpException('엑셀 파일만 업로드 가능합니다.', HttpStatus.BAD_REQUEST), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
  }))
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
  async uploadExcelOrders(@UploadedFile() file: Express.Multer.File, req?: any) {
    if (!file) {
      throw new HttpException('파일이 첨부되지 않았습니다.', HttpStatus.BAD_REQUEST);
    }
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[1]; // 2번째 시트
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { range: 3, defval: '' }); // 5번째 행부터 데이터

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new HttpException('엑셀 파일에서 유효한 데이터를 찾을 수 없습니다.', HttpStatus.BAD_REQUEST);
      }

      // OrderService에는 bulkCreateExcelOrders 메서드가 없으므로 임시로 주석 처리
      // const result = await this.orderService.bulkCreateOrders(jsonData);
      const result = { success: 0, duplicate: 0, failed: jsonData.length, results: [] };
      if (!result.success || result.success === 0) {
        // 중복만 있는 경우
        if (result.duplicate > 0 && result.failed === 0) {
          throw new HttpException(
            `DB 저장: 성공 0, 중복 ${result.duplicate}건`,
            HttpStatus.BAD_REQUEST
          );
        }
        // 진짜 실패가 있는 경우 (예시 row 데이터는 포함하지 않음)
        if (result.failed > 0) {
        throw new HttpException(
            `DB 저장 실패: 성공 0, 실패 ${result.failed}건`,
          HttpStatus.BAD_REQUEST
        );
        }
      }
      // 업로드 이력 저장
      await this.uploadLogService.createLog({
        userId: req?.user?.id,
        fileName: file.originalname,
        successCount: result.success,
        failedCount: result.failed,
        results: result.results,
      });
      return { message: `엑셀 데이터 업로드 완료`, ...result };
    } catch (err) {
      throw new HttpException(
        `엑셀 파일 파싱에 실패했습니다: ${err?.message ?? err}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('orders/by-final-order-number/:finalorderNumber')
  async getOrderByFinalOrderNumber(@Param('finalorderNumber') finalorderNumber: string) {
    return this.orderService.findByOrderNumber(finalorderNumber);
  }

  @Get('excel-orders/progress')
  async sseExcelOrdersProgress(
    @Param() params: any,
    @Req() req: Request,
    @Res() res: Response
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