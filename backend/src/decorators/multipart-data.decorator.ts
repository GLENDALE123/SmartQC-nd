import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MultipartDataInterceptor, MultipartDataOptions } from '../interceptors/multipart-data.interceptor';

export interface MultipartDataDecoratorOptions extends MultipartDataOptions {
  swaggerDescription?: string;
  swaggerExample?: any;
}

/**
 * Decorator for handling multipart/form-data with JSON and file uploads
 * Combines file upload interceptor with JSON parsing and validation
 */
export function MultipartData(options?: MultipartDataDecoratorOptions) {
  const interceptorOptions: MultipartDataOptions = {
    maxFileSize: options?.maxFileSize || 10 * 1024 * 1024,
    maxFiles: options?.maxFiles || 10,
    allowedMimeTypes: options?.allowedMimeTypes,
    allowedExtensions: options?.allowedExtensions,
    jsonField: options?.jsonField || 'data',
  };

  // Create multer options with validation
  const multerOptions = {
    storage: memoryStorage(),
    limits: {
      fileSize: interceptorOptions.maxFileSize,
      files: interceptorOptions.maxFiles,
    },
    fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
      // Basic file validation
      if (interceptorOptions.allowedMimeTypes && 
          !interceptorOptions.allowedMimeTypes.includes(file.mimetype)) {
        return callback(new Error(`지원하지 않는 파일 형식입니다: ${file.mimetype}`), false);
      }
      
      if (interceptorOptions.allowedExtensions) {
        const extension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
        if (!interceptorOptions.allowedExtensions.includes(extension)) {
          return callback(new Error(`지원하지 않는 파일 확장자입니다: ${extension}`), false);
        }
      }
      
      callback(null, true);
    },
  };

  return applyDecorators(
    UseInterceptors(
      FileFieldsInterceptor([{ name: 'attachments', maxCount: interceptorOptions.maxFiles }], multerOptions),
      new MultipartDataInterceptor(interceptorOptions)
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: options?.swaggerDescription || 'Multipart form data with JSON and files',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'string',
            description: 'JSON string containing the main data',
            example: options?.swaggerExample ? JSON.stringify(options.swaggerExample) : '{"key": "value"}',
          },
          attachments: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
            description: 'File attachments (optional)',
          },
        },
        required: ['data'],
      },
    })
  );
}

/**
 * Decorator specifically for inspection creation with optimized settings
 */
export function InspectionMultipartData() {
  return MultipartData({
    maxFileSize: 20 * 1024 * 1024, // 20MB
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
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.txt', '.doc', '.docx'],
    jsonField: 'data',
    swaggerDescription: 'Create inspection with JSON data and optional file attachments',
    swaggerExample: {
      orderNumbers: ['T00000-1', 'T00000-2'],
      client: '삼성전자',
      productName: '120ML원형',
      partName: '본체',
      specification: 'PP',
      manager: '김담당',
      inspectionDate: '2024-01-15',
      totalQty: 100,
      defectQty: 5,
      notes: '검사 메모',
      defects: [
        {
          defectTypeId: 1,
          count: 3
        },
        {
          customType: '기타 불량',
          count: 2
        }
      ]
    },
  });
}

/**
 * Decorator for image uploads only
 */
export function ImageMultipartData() {
  return MultipartData({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    jsonField: 'data',
    swaggerDescription: 'Upload images with optional metadata',
  });
}