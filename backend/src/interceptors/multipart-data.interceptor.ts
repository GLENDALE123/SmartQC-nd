import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

export interface MultipartDataOptions {
  maxFileSize?: number; // bytes
  maxFiles?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  jsonField?: string; // field name containing JSON data
}

@Injectable()
export class MultipartDataInterceptor implements NestInterceptor {
  private readonly defaultOptions: MultipartDataOptions = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    allowedExtensions: [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.gif',
      '.pdf',
      '.txt',
      '.doc',
      '.docx',
    ],
    jsonField: 'data',
  };

  constructor(private readonly options: MultipartDataOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Process the request after file upload (files are already processed by the decorator)
    this.processMultipartData(request);

    return next.handle();
  }

  private validateFile(file: Express.Multer.File): void {
    // Check MIME type
    if (
      this.options.allowedMimeTypes &&
      !this.options.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new UnsupportedMediaTypeException(
        `지원하지 않는 파일 형식입니다. 허용된 형식: ${this.options.allowedMimeTypes.join(', ')}`,
      );
    }

    // Check file extension
    if (this.options.allowedExtensions) {
      const extension = this.getFileExtension(file.originalname);
      if (!this.options.allowedExtensions.includes(extension)) {
        throw new UnsupportedMediaTypeException(
          `지원하지 않는 파일 확장자입니다. 허용된 확장자: ${this.options.allowedExtensions.join(', ')}`,
        );
      }
    }

    // Additional security checks
    this.performSecurityChecks(file);
  }

  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1
      ? filename.substring(lastDotIndex).toLowerCase()
      : '';
  }

  private performSecurityChecks(file: Express.Multer.File): void {
    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|scr|pif|com)$/i,
      /\.(php|jsp|asp|aspx)$/i,
      /\.(js|vbs|ps1)$/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.originalname)) {
        throw new UnsupportedMediaTypeException(
          '보안상 위험한 파일 형식입니다.',
        );
      }
    }

    // Check for null bytes in filename
    if (file.originalname.includes('\0')) {
      throw new BadRequestException(
        '파일명에 잘못된 문자가 포함되어 있습니다.',
      );
    }

    // Check filename length
    if (file.originalname.length > 255) {
      throw new BadRequestException('파일명이 너무 깁니다. (최대 255자)');
    }
  }

  private processMultipartData(request: any): void {
    try {
      // Parse JSON data from the specified field
      if (request.body && request.body[this.options.jsonField]) {
        const jsonData = this.parseJsonData(
          request.body[this.options.jsonField],
        );

        // Replace body with parsed JSON data
        request.body = jsonData;

        // Add files to the parsed data if they exist
        if (request.files && request.files.attachments) {
          request.body.attachments = request.files.attachments.map(
            (file: Express.Multer.File) => ({
              file,
            }),
          );
        }
      }
    } catch (error) {
      throw new BadRequestException(
        `멀티파트 데이터 처리 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  private parseJsonData(jsonString: string): any {
    try {
      const parsed = JSON.parse(jsonString);

      // Validate that it's an object
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('JSON 데이터는 객체 형태여야 합니다.');
      }

      return parsed;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('잘못된 JSON 형식입니다.');
      }
      throw new BadRequestException(error.message);
    }
  }
}

// Factory function for creating interceptor with custom options
export function createMultipartDataInterceptor(options?: MultipartDataOptions) {
  return new MultipartDataInterceptor(options);
}
