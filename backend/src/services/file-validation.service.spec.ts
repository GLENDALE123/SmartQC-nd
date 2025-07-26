import { Test, TestingModule } from '@nestjs/testing';
import { FileValidationService } from './file-validation.service';

describe('FileValidationService', () => {
  let service: FileValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileValidationService],
    }).compile();

    service = module.get<FileValidationService>(FileValidationService);
  });

  describe('validateFile', () => {
    it('should validate a correct image file', () => {
      const validFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('fake image data'),
      } as Express.Multer.File;

      const result = service.validateFile(validFile, service.getImageValidationOptions());

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject file that is too large', () => {
      const largeFile = {
        originalname: 'large.jpg',
        mimetype: 'image/jpeg',
        size: 50 * 1024 * 1024, // 50MB (exceeds 10MB limit for images)
        buffer: Buffer.from('fake large image data'),
      } as Express.Multer.File;

      const result = service.validateFile(largeFile, service.getImageValidationOptions());

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('파일 크기가 너무 큽니다'))).toBe(true);
    });

    it('should reject file with invalid MIME type', () => {
      const invalidFile = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('fake pdf data'),
      } as Express.Multer.File;

      const result = service.validateFile(invalidFile, service.getImageValidationOptions());

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('지원하지 않는 파일 형식입니다'))).toBe(true);
    });

    it('should reject file with invalid extension', () => {
      const invalidFile = {
        originalname: 'test.bmp',
        mimetype: 'image/bmp',
        size: 1024,
        buffer: Buffer.from('fake bmp data'),
      } as Express.Multer.File;

      const result = service.validateFile(invalidFile, service.getImageValidationOptions());

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('지원하지 않는 파일 확장자입니다'))).toBe(true);
    });

    it('should reject suspicious executable files', () => {
      const suspiciousFile = {
        originalname: 'malware.exe',
        mimetype: 'application/x-executable',
        size: 1024,
        buffer: Buffer.from('fake executable data'),
      } as Express.Multer.File;

      const result = service.validateFile(suspiciousFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('보안상 위험한 파일 형식입니다.');
    });

    it('should reject files with directory traversal attempts', () => {
      const traversalFile = {
        originalname: '../../../etc/passwd',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('fake file data'),
      } as Express.Multer.File;

      const result = service.validateFile(traversalFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('파일명에 경로 문자가 포함되어 있습니다.');
    });

    it('should add warning for large files', () => {
      const largeFile = {
        originalname: 'large.jpg',
        mimetype: 'image/jpeg',
        size: 8 * 1024 * 1024, // 8MB (within limit but large)
        buffer: Buffer.from('fake large image data'),
      } as Express.Multer.File;

      const result = service.validateFile(largeFile, service.getImageValidationOptions());

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(warning => warning.includes('파일 크기가 큽니다'))).toBe(true);
    });
  });

  describe('validateFiles', () => {
    it('should validate multiple valid files', () => {
      const files = [
        {
          originalname: 'test1.jpg',
          mimetype: 'image/jpeg',
          size: 1024 * 1024,
          buffer: Buffer.from('fake image 1'),
        },
        {
          originalname: 'test2.png',
          mimetype: 'image/png',
          size: 2 * 1024 * 1024,
          buffer: Buffer.from('fake image 2'),
        },
      ] as Express.Multer.File[];

      const result = service.validateFiles(files, service.getImageValidationOptions());

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject when too many files are provided', () => {
      const files = Array.from({ length: 15 }, (_, i) => ({
        originalname: `test${i}.jpg`,
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from(`fake image ${i}`),
      })) as Express.Multer.File[];

      const result = service.validateFiles(files, service.getImageValidationOptions());

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('파일 개수가 너무 많습니다'))).toBe(true);
    });

    it('should reject when total file size exceeds limit', () => {
      const files = Array.from({ length: 5 }, (_, i) => ({
        originalname: `test${i}.jpg`,
        mimetype: 'image/jpeg',
        size: 15 * 1024 * 1024, // 15MB each, total 75MB
        buffer: Buffer.from(`fake large image ${i}`),
      })) as Express.Multer.File[];

      const result = service.validateFiles(files, service.getImageValidationOptions());

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('파일 크기가 너무 큽니다'))).toBe(true);
    });

    it('should provide detailed error messages for individual files', () => {
      const files = [
        {
          originalname: 'valid.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          buffer: Buffer.from('valid image'),
        },
        {
          originalname: 'invalid.exe',
          mimetype: 'application/x-executable',
          size: 1024,
          buffer: Buffer.from('malware'),
        },
      ] as Express.Multer.File[];

      const result = service.validateFiles(files);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('파일 2 (invalid.exe)'))).toBe(true);
    });
  });

  describe('validation options', () => {
    it('should provide correct image validation options', () => {
      const options = service.getImageValidationOptions();

      expect(options.maxFileSize).toBe(10 * 1024 * 1024);
      expect(options.allowedMimeTypes).toContain('image/jpeg');
      expect(options.allowedExtensions).toContain('.jpg');
      expect(options.maxFiles).toBe(10);
    });

    it('should provide correct document validation options', () => {
      const options = service.getDocumentValidationOptions();

      expect(options.maxFileSize).toBe(50 * 1024 * 1024);
      expect(options.allowedMimeTypes).toContain('application/pdf');
      expect(options.allowedExtensions).toContain('.pdf');
      expect(options.maxFiles).toBe(5);
    });

    it('should provide correct inspection attachment options', () => {
      const options = service.getInspectionAttachmentOptions();

      expect(options.maxFileSize).toBe(20 * 1024 * 1024);
      expect(options.allowedMimeTypes).toContain('image/jpeg');
      expect(options.allowedMimeTypes).toContain('application/pdf');
      expect(options.allowedExtensions).toContain('.jpg');
      expect(options.allowedExtensions).toContain('.pdf');
      expect(options.maxFiles).toBe(10);
    });
  });

  describe('file size formatting', () => {
    it('should format file sizes correctly', () => {
      // Access private method for testing
      const formatFileSize = (service as any).formatFileSize;

      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatFileSize(1536)).toBe('1.5 KB'); // 1.5 KB
    });
  });
});