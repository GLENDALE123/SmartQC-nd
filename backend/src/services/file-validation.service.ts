import {
  Injectable,
  BadRequestException,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
} from '@nestjs/common';

export interface FileValidationOptions {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  maxFiles?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class FileValidationService {
  private readonly defaultImageOptions: FileValidationOptions = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    maxFiles: 10,
  };

  private readonly defaultDocumentOptions: FileValidationOptions = {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    allowedExtensions: ['.pdf', '.txt', '.doc', '.docx', '.xls', '.xlsx'],
    maxFiles: 5,
  };

  /**
   * Validate a single file
   */
  validateFile(
    file: Express.Multer.File,
    options: FileValidationOptions = this.defaultImageOptions
  ): FileValidationResult {
    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Check if file exists
    if (!file) {
      result.isValid = false;
      result.errors.push('파일이 제공되지 않았습니다.');
      return result;
    }

    // Validate file size
    if (options.maxFileSize && file.size > options.maxFileSize) {
      result.isValid = false;
      result.errors.push(
        `파일 크기가 너무 큽니다. 최대 크기: ${this.formatFileSize(options.maxFileSize)}`
      );
    }

    // Validate MIME type
    if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(file.mimetype)) {
      result.isValid = false;
      result.errors.push(
        `지원하지 않는 파일 형식입니다. 허용된 형식: ${options.allowedMimeTypes.join(', ')}`
      );
    }

    // Validate file extension
    if (options.allowedExtensions) {
      const extension = this.getFileExtension(file.originalname);
      if (!options.allowedExtensions.includes(extension)) {
        result.isValid = false;
        result.errors.push(
          `지원하지 않는 파일 확장자입니다. 허용된 확장자: ${options.allowedExtensions.join(', ')}`
        );
      }
    }

    // Security validations
    const securityResult = this.validateFileSecurity(file);
    if (!securityResult.isValid) {
      result.isValid = false;
      result.errors.push(...securityResult.errors);
    }

    // Performance warnings
    if (file.size > 5 * 1024 * 1024) { // 5MB
      result.warnings.push('파일 크기가 큽니다. 업로드 시간이 오래 걸릴 수 있습니다.');
    }

    return result;
  }

  /**
   * Validate multiple files
   */
  validateFiles(
    files: Express.Multer.File[],
    options: FileValidationOptions = this.defaultImageOptions
  ): FileValidationResult {
    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Check file count
    if (options.maxFiles && files.length > options.maxFiles) {
      result.isValid = false;
      result.errors.push(`파일 개수가 너무 많습니다. 최대 ${options.maxFiles}개까지 허용됩니다.`);
      return result;
    }

    // Validate each file
    files.forEach((file, index) => {
      const fileResult = this.validateFile(file, options);
      if (!fileResult.isValid) {
        result.isValid = false;
        result.errors.push(`파일 ${index + 1} (${file.originalname}): ${fileResult.errors.join(', ')}`);
      }
      result.warnings.push(...fileResult.warnings);
    });

    // Check total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = (options.maxFileSize || 10 * 1024 * 1024) * (options.maxFiles || 10);
    
    if (totalSize > maxTotalSize) {
      result.isValid = false;
      result.errors.push(
        `전체 파일 크기가 너무 큽니다. 최대 크기: ${this.formatFileSize(maxTotalSize)}`
      );
    }

    return result;
  }

  /**
   * Validate file security
   */
  private validateFileSecurity(file: Express.Multer.File): FileValidationResult {
    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Check for suspicious file extensions
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|scr|pif|com)$/i,
      /\.(php|jsp|asp|aspx)$/i,
      /\.(js|vbs|ps1|sh)$/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.originalname)) {
        result.isValid = false;
        result.errors.push('보안상 위험한 파일 형식입니다.');
        break;
      }
    }

    // Check for null bytes in filename
    if (file.originalname.includes('\0')) {
      result.isValid = false;
      result.errors.push('파일명에 잘못된 문자가 포함되어 있습니다.');
    }

    // Check filename length
    if (file.originalname.length > 255) {
      result.isValid = false;
      result.errors.push('파일명이 너무 깁니다. (최대 255자)');
    }

    // Check for directory traversal attempts
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      result.isValid = false;
      result.errors.push('파일명에 경로 문자가 포함되어 있습니다.');
    }

    return result;
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex).toLowerCase() : '';
  }

  /**
   * Format file size for human reading
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get validation options for images
   */
  getImageValidationOptions(): FileValidationOptions {
    return { ...this.defaultImageOptions };
  }

  /**
   * Get validation options for documents
   */
  getDocumentValidationOptions(): FileValidationOptions {
    return { ...this.defaultDocumentOptions };
  }

  /**
   * Get validation options for inspection attachments (mixed)
   */
  getInspectionAttachmentOptions(): FileValidationOptions {
    return {
      maxFileSize: 20 * 1024 * 1024, // 20MB
      allowedMimeTypes: [
        ...this.defaultImageOptions.allowedMimeTypes,
        ...this.defaultDocumentOptions.allowedMimeTypes,
      ],
      allowedExtensions: [
        ...this.defaultImageOptions.allowedExtensions,
        ...this.defaultDocumentOptions.allowedExtensions,
      ],
      maxFiles: 10,
    };
  }
}