import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SharedFolderService } from '../services/shared-folder.service';
import { FileValidationService } from '../services/file-validation.service';
import { PrismaService } from '../prisma.service';
import { ImageMultipartData } from '../decorators/multipart-data.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';

@ApiTags('파일 업로드')
@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly sharedFolderService: SharedFolderService,
    private readonly fileValidationService: FileValidationService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  @ApiOperation({ summary: '이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '이미지 파일과 검사 ID',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '업로드할 이미지 파일',
        },
        inspectionId: {
          type: 'string',
          description: '검사 ID',
        },
        inspectionType: {
          type: 'string',
          enum: ['incoming', 'process', 'shipment'],
          description: '검사 유형 (선택사항)',
        },
      },
      required: ['image', 'inspectionId'],
    },
  })
  @ApiResponse({ status: 201, description: '이미지 업로드 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('inspectionId') inspectionId: string,
    @Body('inspectionType')
    inspectionType?: 'incoming' | 'process' | 'shipment',
  ) {
    if (!file) {
      throw new HttpException(
        '이미지 파일이 첨부되지 않았습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!inspectionId) {
      throw new HttpException(
        '검사 ID가 제공되지 않았습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 파일 검증
    const validationResult = this.fileValidationService.validateFile(
      file,
      this.fileValidationService.getImageValidationOptions(),
    );

    if (!validationResult.isValid) {
      throw new HttpException(
        {
          message: '파일 검증 실패',
          errors: validationResult.errors,
          warnings: validationResult.warnings,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const parsedInspectionId = parseInt(inspectionId);

      let result;
      if (inspectionType) {
        // 검사 유형이 지정된 경우 해당 검사와 연결하여 업로드
        result = await this.sharedFolderService.uploadImageWithInspectionId(
          file,
          parsedInspectionId,
          inspectionType,
        );
      } else {
        // 검사 유형이 지정되지 않은 경우 임시 업로드
        result = await this.sharedFolderService.uploadImage(
          file,
          parsedInspectionId,
        );
      }

      return {
        message: '이미지 업로드 성공',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        `이미지 업로드 실패: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('images/:inspectionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '검사별 이미지 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '이미지 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            inspectionId: { type: 'number' },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  fileName: { type: 'string' },
                  originalPath: { type: 'string' },
                  thumbnailPath: { type: 'string' },
                  modalPath: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  async getImagesByInspection(@Param('inspectionId') inspectionId: string) {
    try {
      const parsedInspectionId = parseInt(inspectionId);
      if (isNaN(parsedInspectionId)) {
        throw new HttpException(
          '유효하지 않은 검사 ID입니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const images =
        await this.sharedFolderService.getImagesByInspection(
          parsedInspectionId,
        );

      return {
        message: '이미지 목록 조회 성공',
        data: {
          inspectionId: parsedInspectionId,
          images: images,
        },
      };
    } catch (error) {
      throw new HttpException(
        `이미지 목록 조회 실패: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('images/serve/:type/:inspectionId/:filename')
  @ApiOperation({ summary: '이미지 파일 서빙' })
  @ApiResponse({ status: 200, description: '이미지 파일 반환' })
  @ApiResponse({ status: 404, description: '이미지를 찾을 수 없음' })
  async serveImage(
    @Param('type') type: 'original' | 'thumbnail' | 'modal',
    @Param('inspectionId') inspectionId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      // 파일 경로 구성
      const basePath = process.cwd() + '/../images';
      const filePath = join(
        basePath,
        'inspections',
        inspectionId,
        type,
        filename,
      );

      // 파일 존재 확인
      if (!existsSync(filePath)) {
        return res.status(404).json({ message: '이미지를 찾을 수 없습니다.' });
      }

      // 파일 타입에 따른 Content-Type 설정
      let contentType = 'image/jpeg';
      if (filename.endsWith('.png')) contentType = 'image/png';
      else if (filename.endsWith('.webp')) contentType = 'image/webp';
      else if (filename.endsWith('.gif')) contentType = 'image/gif';

      // 파일 스트리밍
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1년 캐시
      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({ message: '이미지 서빙 중 오류가 발생했습니다.' });
    }
  }

  @Get('images/attachment/:id/:type')
  @ApiOperation({ summary: 'Attachment ID로 이미지 반환' })
  @ApiResponse({ status: 200, description: '이미지 파일 반환' })
  @ApiResponse({ status: 404, description: '이미지를 찾을 수 없음' })
  async serveImageById(
    @Param('id') id: string,
    @Param('type') type: 'original' | 'thumbnail' | 'modal',
    @Res() res: Response,
  ) {
    try {
      // attachment 조회
      const attachment = await this.prisma.attachment.findUnique({
        where: { id: parseInt(id) },
      });

      if (!attachment) {
        return res.status(404).json({ message: 'Attachment not found' });
      }

      const fileName = attachment.fileName;
      const basePath = attachment.url;
      let filePath = '';

      if (type === 'original')
        filePath = join(basePath, 'original', `${fileName}.jpg`);
      if (type === 'thumbnail')
        filePath = join(basePath, 'thumbnail', `${fileName}-thumb.jpg`);
      if (type === 'modal')
        filePath = join(basePath, 'modal', `${fileName}-modal.jpg`);

      if (!existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Content-Type 설정
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      const stream = createReadStream(filePath);
      stream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: '이미지 서빙 중 오류가 발생했습니다.' });
    }
  }

  @Delete('images/:inspectionId/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '이미지 삭제' })
  @ApiResponse({ status: 200, description: '이미지 삭제 성공' })
  @ApiResponse({ status: 404, description: '이미지를 찾을 수 없음' })
  async deleteImage(
    @Param('inspectionId') inspectionId: string,
    @Param('imageId') imageId: string,
    @Body()
    imageData?: {
      originalPath: string;
      thumbnailPath: string;
      modalPath: string;
    },
  ) {
    try {
      await this.sharedFolderService.deleteImage(imageId, imageData);

      return {
        message: '이미지 삭제 성공',
        data: { id: imageId },
      };
    } catch (error) {
      throw new HttpException(
        `이미지 삭제 실패: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('images/inspection/:inspectionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '검사 관련 모든 이미지 삭제' })
  @ApiResponse({ status: 200, description: '검사 이미지 삭제 성공' })
  async deleteInspectionImages(@Param('inspectionId') inspectionId: string) {
    try {
      const parsedInspectionId = parseInt(inspectionId);
      if (isNaN(parsedInspectionId)) {
        throw new HttpException(
          '유효하지 않은 검사 ID입니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.sharedFolderService.deleteInspectionFolder(parsedInspectionId);

      return {
        message: '검사 이미지 삭제 성공',
        data: { inspectionId: parsedInspectionId },
      };
    } catch (error) {
      throw new HttpException(
        `검사 이미지 삭제 실패: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('test/connection')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '이미지 저장소 연결 테스트' })
  @ApiResponse({ status: 200, description: '연결 테스트 성공' })
  async testConnection() {
    try {
      await this.sharedFolderService.testAccess();

      return {
        message: '이미지 저장소 연결 테스트 성공',
        data: {
          status: 'connected',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new HttpException(
        `연결 테스트 실패: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
