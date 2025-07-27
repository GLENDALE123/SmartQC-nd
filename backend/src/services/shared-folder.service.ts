import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { writeFileSync, mkdirSync, accessSync, constants, unlinkSync, existsSync, rmdirSync } from 'fs';
import { join, resolve } from 'path';
import * as sharp from 'sharp';
import { PrismaService } from '../prisma.service';
// import { exec } from 'child_process';
// import { promisify } from 'util';

// const execAsync = promisify(exec);

@Injectable()
export class SharedFolderService {
  private readonly logger = new Logger(SharedFolderService.name);
  private readonly sharedPath: string;
  private readonly username: string;
  private readonly password: string;
  private readonly maxFileSize: number;
  private readonly allowedTypes: string[];
  private readonly baseImagePath: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    const sharedPath = this.configService.get<string>('SHARED_FOLDER_PATH');
    const username = this.configService.get<string>('SHARED_FOLDER_USERNAME');
    const password = this.configService.get<string>('SHARED_FOLDER_PASSWORD');
    // 환경변수는 남겨두되 실제로는 사용하지 않음
    this.sharedPath = sharedPath || '';
    this.username = username || '';
    this.password = password || '';
    this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE', 5242880);
    this.allowedTypes = this.configService.get<string>('ALLOWED_IMAGE_TYPES', 'image/jpeg,image/png,image/webp').split(',');
    // 프로젝트 루트의 images 폴더를 기본 저장소로 사용
    this.baseImagePath = resolve(process.cwd(), '..', 'images');
    mkdirSync(this.baseImagePath, { recursive: true });
    this.logger.log(`✅ 이미지 저장 경로 설정: ${this.baseImagePath}`);
  }

  /**
   * 네트워크 드라이브 마운트 (현재 미사용)
   */
  // private async mountNetworkDrive(): Promise<void> {
  //   try {
  //     await execAsync('net use Z: /delete /y').catch(() => {});
  //     const command = `net use Z: ${this.sharedPath} /user:${this.username} ${this.password} /persistent:yes`;
  //     await execAsync(command);
  //     this.logger.log('✅ 네트워크 드라이브 마운트 성공');
  //   } catch (error) {
  //     this.logger.error('❌ 네트워크 드라이브 마운트 실패:', error.message);
  //     throw new Error(`네트워크 드라이브 마운트 실패: ${error.message}`);
  //   }
  // }

  /**
   * 공유폴더 접근 테스트 (현재는 images 폴더 접근 테스트)
   */
  async testAccess(): Promise<void> {
    try {
      const testPath = join(this.baseImagePath, 'test-access.txt');
      const testContent = 'test';
      writeFileSync(testPath, testContent);
      accessSync(testPath, constants.R_OK);
      unlinkSync(testPath);
      this.logger.log('✅ images 폴더 접근 테스트 성공');
    } catch (error) {
      this.logger.error('❌ images 폴더 접근 테스트 실패:', error.message);
      throw new Error(`images 폴더 접근 실패: ${error.message}`);
    }
  }

  validateImageFile(file: Express.Multer.File): void {
    if (file.size > this.maxFileSize) {
      throw new Error(`파일 크기가 너무 큽니다. 최대 ${this.maxFileSize / 1024 / 1024}MB까지 허용됩니다.`);
    }
    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new Error(`지원하지 않는 이미지 형식입니다. 허용된 형식: ${this.allowedTypes.join(', ')}`);
    }
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    if (safeName !== file.originalname) {
      throw new Error('파일명에 특수문자가 포함되어 있습니다.');
    }
  }

  async uploadImage(file: Express.Multer.File, inspectionId: number): Promise<{
    id: string;
    fileName: string;
    originalPath: string;
    thumbnailPath: string;
    modalPath: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
  }> {
    try {
      this.validateImageFile(file);
      
      // 폴더 구조 생성
      const inspectionFolder = join(this.baseImagePath, 'inspections', inspectionId.toString());
      const originalFolder = join(inspectionFolder, 'original');
      const thumbnailFolder = join(inspectionFolder, 'thumbnail');
      const modalFolder = join(inspectionFolder, 'modal');
      
      mkdirSync(originalFolder, { recursive: true });
      mkdirSync(thumbnailFolder, { recursive: true });
      mkdirSync(modalFolder, { recursive: true });
      
      // 타임스탬프 제거 - 프론트에서 보낸 파일명을 그대로 사용
      const baseFileName = file.originalname.replace(/\.[^/.]+$/, '');
      
      // 원본 이미지 저장
      const originalPath = join(originalFolder, `${baseFileName}.jpg`);
      writeFileSync(originalPath, file.buffer);
      
      // 썸네일 생성 (150x150)
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(150, 150, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();
      const thumbnailPath = join(thumbnailFolder, `${baseFileName}-thumb.jpg`);
      writeFileSync(thumbnailPath, thumbnailBuffer);
      
      // 모달용 이미지 생성 (800x600)
      const modalBuffer = await sharp(file.buffer)
        .resize(800, 600, { fit: 'inside' })
        .jpeg({ quality: 85 })
        .toBuffer();
      const modalPath = join(modalFolder, `${baseFileName}-modal.jpg`);
      writeFileSync(modalPath, modalBuffer);
      
      // DB에 Attachment 레코드 저장 (inspectionId를 바로 저장)
      // 이미지 업로드 처리
      
      const attachmentData = {
        url: inspectionFolder, // inspectionId까지만 저장
        fileName: baseFileName, // 확장자 없는 순수 파일명만 저장
        // 모든 inspectionId를 null로 저장 (나중에 정확한 타입으로 업데이트)
        incomingInspectionId: null,
        processInspectionId: null,
        shipmentInspectionId: null,
      };
      
      const attachment = await this.prisma.attachment.create({
          data: attachmentData
        });
      
      const result = {
        id: attachment.id.toString(),
        fileName: file.originalname,
        originalPath: originalPath,
        thumbnailPath: thumbnailPath,
        modalPath: modalPath,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date()
      };
      
      this.logger.log(`✅ 이미지 업로드 성공: ${result.fileName} (DB 저장 완료)`);
      return result;
    } catch (error) {
      this.logger.error('❌ 이미지 업로드 실패:', error.message);
      throw new Error(`이미지 업로드 실패: ${error.message}`);
    }
  }

  /**
   * 이미지를 특정 검사와 함께 업로드 (검사 저장 시 사용)
   */
  async uploadImageWithInspectionId(
    file: Express.Multer.File, 
    inspectionId: number, 
    inspectionType: 'incoming' | 'process' | 'shipment'
  ): Promise<{
    id: string;
    fileName: string;
    originalPath: string;
    thumbnailPath: string;
    modalPath: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
  }> {
    try {
      this.validateImageFile(file);
      
      // 폴더 구조 생성
      const inspectionFolder = join(this.baseImagePath, 'inspections', inspectionId.toString());
      const originalFolder = join(inspectionFolder, 'original');
      const thumbnailFolder = join(inspectionFolder, 'thumbnail');
      const modalFolder = join(inspectionFolder, 'modal');
      
      mkdirSync(originalFolder, { recursive: true });
      mkdirSync(thumbnailFolder, { recursive: true });
      mkdirSync(modalFolder, { recursive: true });
      
      // 타임스탬프 제거 - 프론트에서 보낸 파일명을 그대로 사용
      const baseFileName = file.originalname.replace(/\.[^/.]+$/, '');
      
      // 원본 이미지 저장
      const originalPath = join(originalFolder, `${baseFileName}.jpg`);
      writeFileSync(originalPath, file.buffer);
      
      // 썸네일 생성 (150x150)
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(150, 150, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();
      const thumbnailPath = join(thumbnailFolder, `${baseFileName}-thumb.jpg`);
      writeFileSync(thumbnailPath, thumbnailBuffer);
      
      // 모달용 이미지 생성 (800x600)
      const modalBuffer = await sharp(file.buffer)
        .resize(800, 600, { fit: 'inside' })
        .jpeg({ quality: 85 })
        .toBuffer();
      const modalPath = join(modalFolder, `${baseFileName}-modal.jpg`);
      writeFileSync(modalPath, modalBuffer);
      
      // DB에 Attachment 레코드 저장 (올바른 inspectionId로 저장)
      const attachmentData: any = {
        url: inspectionFolder,
        fileName: baseFileName,
        incomingInspectionId: null,
        processInspectionId: null,
        shipmentInspectionId: null,
      };
      
      // inspectionType에 따라 올바른 필드 설정
      if (inspectionType === 'incoming') {
        attachmentData.incomingInspectionId = inspectionId;
      } else if (inspectionType === 'process') {
        attachmentData.processInspectionId = inspectionId;
      } else if (inspectionType === 'shipment') {
        attachmentData.shipmentInspectionId = inspectionId;
      }
      
      const attachment = await this.prisma.attachment.create({
        data: attachmentData
      });
      
      const result = {
        id: attachment.id.toString(),
        fileName: file.originalname,
        originalPath: originalPath,
        thumbnailPath: thumbnailPath,
        modalPath: modalPath,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date()
      };
      
      this.logger.log(`✅ 이미지 업로드 성공 (${inspectionType}): ${result.fileName} (검사 ID: ${inspectionId})`);
      return result;
    } catch (error) {
      this.logger.error('❌ 이미지 업로드 실패:', error.message);
      throw new Error(`이미지 업로드 실패: ${error.message}`);
    }
  }

  async deleteImage(imageId: string, imageData?: { originalPath: string; thumbnailPath: string; modalPath: string }): Promise<void> {
    try {
      // DB에서 Attachment 레코드 조회하여 파일 경로 조합
      const attachment = await this.prisma.attachment.findUnique({
        where: { id: parseInt(imageId) }
      });
      
      if (!attachment) {
        throw new Error(`Attachment not found with ID: ${imageId}`);
      }
      
      // 파일 경로 조합 (매개변수가 없으면 자체적으로 조합)
      const baseFileName = attachment.fileName.replace(/\.[^/.]+$/, '');
      const originalPath = imageData?.originalPath || join(attachment.url, 'original', `${baseFileName}.jpg`);
      const thumbnailPath = imageData?.thumbnailPath || join(attachment.url, 'thumbnail', `${baseFileName}-thumb.jpg`);
      const modalPath = imageData?.modalPath || join(attachment.url, 'modal', `${baseFileName}-modal.jpg`);
      
      // 파일 시스템에서 모든 버전의 이미지 삭제 (파일이 없어도 에러 발생하지 않음)
      const filesToDelete = [
        { path: originalPath, type: '원본' },
        { path: thumbnailPath, type: '썸네일' },
        { path: modalPath, type: '모달' }
      ];
      
      for (const file of filesToDelete) {
        try {
          if (existsSync(file.path)) {
            unlinkSync(file.path);
            this.logger.log(`✅ ${file.type} 이미지 파일 삭제: ${file.path}`);
          } else {
            this.logger.warn(`⚠️ ${file.type} 이미지 파일이 존재하지 않음: ${file.path}`);
          }
        } catch (error) {
          this.logger.error(`❌ ${file.type} 이미지 파일 삭제 실패: ${file.path}`, error.message);
          // 개별 파일 삭제 실패해도 계속 진행
        }
      }
      
      // DB에서 Attachment 레코드 삭제
      await this.prisma.attachment.delete({
        where: { id: parseInt(imageId) }
      });
      
      this.logger.log(`✅ 이미지 삭제 완료 (ID: ${imageId})`);
    } catch (error) {
      this.logger.error('❌ 이미지 삭제 실패:', error.message);
      throw new Error(`이미지 삭제 실패: ${error.message}`);
    }
  }

  /**
   * 검사 폴더 전체 삭제 (검사 삭제 시 사용)
   */
  async deleteInspectionFolder(inspectionId: number): Promise<void> {
    try {
      const inspectionFolder = join(this.baseImagePath, 'inspections', inspectionId.toString());
      
      if (!existsSync(inspectionFolder)) {
        this.logger.warn(`⚠️ 검사 폴더가 존재하지 않음: ${inspectionFolder}`);
        return;
      }
      
      // 폴더 내의 모든 파일과 하위 폴더 삭제
      this.deleteFolderRecursively(inspectionFolder);
      
      this.logger.log(`✅ 검사 폴더 삭제 완료: ${inspectionFolder}`);
    } catch (error) {
      this.logger.error('❌ 검사 폴더 삭제 실패:', error.message);
      throw new Error(`검사 폴더 삭제 실패: ${error.message}`);
    }
  }

  /**
   * 폴더와 그 내용을 재귀적으로 삭제
   */
  private deleteFolderRecursively(folderPath: string): void {
    if (!existsSync(folderPath)) {
      return;
    }

    const { lstatSync, readdirSync, unlinkSync, rmdirSync } = require('fs');

    if (lstatSync(folderPath).isDirectory()) {
      const files = readdirSync(folderPath);
      for (const file of files) {
        const curPath = join(folderPath, file);
        if (lstatSync(curPath).isDirectory()) {
          this.deleteFolderRecursively(curPath);
        } else {
          unlinkSync(curPath);
        }
      }
      rmdirSync(folderPath);
    }
  }

  async getImagesByInspection(inspectionId: number): Promise<Array<{
    id: string;
    fileName: string;
    originalPath: string;
    thumbnailPath: string;
    modalPath: string;
  }>> {
    try {
      // DB에서 해당 inspectionId와 연결된 Attachment 레코드들을 조회
      const attachments = await this.prisma.attachment.findMany({
        where: {
          OR: [
            { incomingInspectionId: inspectionId },
            { processInspectionId: inspectionId },
            { shipmentInspectionId: inspectionId },
            // 임시 이미지들도 포함 (inspectionId 폴더에 있는 모든 이미지)
            {
              AND: [
                { incomingInspectionId: null },
                { processInspectionId: null },
                { shipmentInspectionId: null },
                {
                  url: {
                    contains: `inspections\\${inspectionId}\\`
                  }
                }
              ]
            }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
      
      const result: Array<{
        id: string;
        fileName: string;
        originalPath: string;
        thumbnailPath: string;
        modalPath: string;
      }> = [];
      
      for (const attachment of attachments) {
        // 파일 경로에서 썸네일과 모달 경로 생성
        const originalPath = join(attachment.url, 'original', `${attachment.fileName.replace(/\.[^/.]+$/, '')}.jpg`);
        const thumbnailPath = join(attachment.url, 'thumbnail', `${attachment.fileName.replace(/\.[^/.]+$/, '')}-thumb.jpg`);
        const modalPath = join(attachment.url, 'modal', `${attachment.fileName.replace(/\.[^/.]+$/, '')}-modal.jpg`);
        
        result.push({
          id: attachment.id.toString(),
          fileName: attachment.fileName,
          originalPath: originalPath,
          thumbnailPath: thumbnailPath,
          modalPath: modalPath
        });
      }
      
      return result;
    } catch (error) {
      this.logger.error('❌ 이미지 목록 조회 실패:', error.message);
      throw new Error(`이미지 목록 조회 실패: ${error.message}`);
    }
  }
}