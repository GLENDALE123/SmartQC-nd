import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Res,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { SharedFolderService } from '../services/shared-folder.service';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';

@ApiTags('이미지 업로드')
@Controller('image-upload')
export class ImageUploadController {
  constructor(
    private readonly sharedFolderService: SharedFolderService,
    private readonly prisma: PrismaService
  ) {}

  @Post(':inspectionId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new HttpException('이미지 파일만 업로드 가능합니다.', HttpStatus.BAD_REQUEST), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
  }))
  @ApiOperation({ summary: '이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: '이미지 업로드 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('inspectionId') inspectionId: string,
  ) {
    if (!file) {
      throw new HttpException('이미지 파일이 첨부되지 않았습니다.', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.sharedFolderService.uploadImage(file, parseInt(inspectionId));
      return {
        message: '이미지 업로드 성공',
        data: result
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':inspectionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '검사별 이미지 목록 조회' })
  async getImagesByInspection(@Param('inspectionId') inspectionId: string) {
    try {
      const images = await this.sharedFolderService.getImagesByInspection(parseInt(inspectionId));
      
      return {
        message: '이미지 목록 조회 성공',
        data: {
          inspectionId: parseInt(inspectionId),
          images: images
        }
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('serve/:type/:inspectionId/:filename')
  @ApiOperation({ summary: '이미지 파일 서빙' })
  async serveImage(
    @Param('type') type: string,
    @Param('inspectionId') inspectionId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      // 파일 경로 구성
      const basePath = 'C:\\Users\\ghfud\\Desktop\\SmartQC.ver1\\images';
      const filePath = join(basePath, 'inspections', inspectionId, type, filename);
      
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

  // attachment id와 type으로 이미지 반환
  @Get('/attachments/:id/:type')
  @ApiOperation({ summary: 'attachment id와 type으로 이미지 반환' })
  async serveImageById(
    @Param('id') id: string,
    @Param('type') type: 'original' | 'thumbnail' | 'modal',
    @Res() res: Response,
  ) {
    try {
      // attachment 조회
      const attachment = await this.prisma.attachment.findUnique({ where: { id: parseInt(id) } });
      if (!attachment) return res.status(404).json({ message: 'Attachment not found' });
      const fileName = attachment.fileName;
      const basePath = attachment.url;
      let filePath = '';
      if (type === 'original') filePath = join(basePath, 'original', `${fileName}.jpg`);
      if (type === 'thumbnail') filePath = join(basePath, 'thumbnail', `${fileName}-thumb.jpg`);
      if (type === 'modal') filePath = join(basePath, 'modal', `${fileName}-modal.jpg`);
      if (!existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
      // Content-Type
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      const stream = createReadStream(filePath);
      stream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: '이미지 서빙 중 오류가 발생했습니다.' });
    }
  }

  @Delete(':inspectionId/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '이미지 삭제' })
  async deleteImage(
    @Param('inspectionId') inspectionId: string,
    @Param('imageId') imageId: string,
    @Body() imageData: { originalPath: string; thumbnailPath: string; modalPath: string },
  ) {
    try {
      await this.sharedFolderService.deleteImage(imageId, imageData);
      return {
        message: '이미지 삭제 성공',
        data: { id: imageId }
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('test/connection')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '이미지 저장소 연결 테스트' })
  async testConnection() {
    try {
      await this.sharedFolderService.testAccess();
      return {
        message: '공유폴더 연결 테스트 성공',
        data: {
          status: 'connected',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 