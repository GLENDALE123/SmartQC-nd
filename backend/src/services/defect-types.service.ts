import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DefectType, Prisma } from '@prisma/client';
import { CreateDefectTypeDto } from '../dto/create-defect-type.dto';
import { UpdateDefectTypeDto } from '../dto/update-defect-type.dto';
import { ColorValidationService } from './color-validation.service';

@Injectable()
export class DefectTypesService {
  private readonly logger = new Logger(DefectTypesService.name);

  constructor(
    private prisma: PrismaService,
    private colorValidationService: ColorValidationService
  ) {}

  async getDefectTypes(): Promise<any[]> {
    try {
      const defectTypes = await this.prisma.defectType.findMany({ 
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // 색상 정보 처리
      return defectTypes.map(defectType => ({
        ...defectType,
        colorInfo: defectType.color ? this.colorValidationService.generateColorInfo(defectType.color) : null
      }));
    } catch (error) {
      this.logger.error('Failed to fetch defect types', error);
      throw error;
    }
  }

  async getDefectTypeById(id: number): Promise<any | null> {
    try {
      const defectType = await this.prisma.defectType.findUnique({ 
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!defectType) {
        return null;
      }

      // 색상 정보 처리
      return {
        ...defectType,
        colorInfo: defectType.color ? this.colorValidationService.generateColorInfo(defectType.color) : null
      };
    } catch (error) {
      this.logger.error(`Failed to fetch defect type with id ${id}`, error);
      throw error;
    }
  }

  async createDefectType(createDefectTypeDto: CreateDefectTypeDto): Promise<any> {
    try {
      // 색상 정규화
      const normalizedData = {
        ...createDefectTypeDto,
        color: createDefectTypeDto.color ? this.colorValidationService.normalizeColor(createDefectTypeDto.color) : null
      };

      const defectType = await this.prisma.defectType.create({ 
        data: normalizedData,
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // 색상 정보 처리
      return {
        ...defectType,
        colorInfo: defectType.color ? this.colorValidationService.generateColorInfo(defectType.color) : null
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.warn(`Attempt to create duplicate defect type: ${createDefectTypeDto.name}`);
          throw new ConflictException('이미 존재하는 불량 유형입니다');
        }
      }
      this.logger.error('Failed to create defect type', error);
      throw error;
    }
  }

  async updateDefectType(id: number, updateDefectTypeDto: UpdateDefectTypeDto): Promise<any | null> {
    try {
      // First check if the defect type exists
      const existingDefectType = await this.prisma.defectType.findUnique({ where: { id } });
      if (!existingDefectType) {
        return null;
      }

      // 색상 정규화
      const normalizedData = {
        ...updateDefectTypeDto,
        color: updateDefectTypeDto.color ? this.colorValidationService.normalizeColor(updateDefectTypeDto.color) : updateDefectTypeDto.color
      };

      const defectType = await this.prisma.defectType.update({ 
        where: { id }, 
        data: normalizedData,
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // 색상 정보 처리
      return {
        ...defectType,
        colorInfo: defectType.color ? this.colorValidationService.generateColorInfo(defectType.color) : null
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.warn(`Attempt to update defect type to duplicate name: ${updateDefectTypeDto.name}`);
          throw new ConflictException('이미 존재하는 불량 유형입니다');
        }
        if (error.code === 'P2025') {
          this.logger.warn(`Attempt to update non-existent defect type with id ${id}`);
          return null;
        }
      }
      this.logger.error(`Failed to update defect type with id ${id}`, error);
      throw error;
    }
  }

  async deleteDefectType(id: number): Promise<boolean> {
    try {
      // First check if the defect type exists
      const existingDefectType = await this.prisma.defectType.findUnique({ where: { id } });
      if (!existingDefectType) {
        return false;
      }

      // Check if the defect type is being used in any inspections
      const usageCount = await this.checkDefectTypeUsage(id);
      if (usageCount > 0) {
        throw new ConflictException('사용 중인 불량 유형은 삭제할 수 없습니다');
      }

      await this.prisma.defectType.delete({ where: { id } });
      this.logger.log(`Successfully deleted defect type with id ${id}`);
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Attempt to delete non-existent defect type with id ${id}`);
          return false;
        }
        if (error.code === 'P2003') {
          this.logger.warn(`Attempt to delete defect type with id ${id} that is referenced by other records`);
          throw new ConflictException('사용 중인 불량 유형은 삭제할 수 없습니다');
        }
      }
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to delete defect type with id ${id}`, error);
      throw error;
    }
  }

  private async checkDefectTypeUsage(defectTypeId: number): Promise<number> {
    try {
      const [incomingCount, processCount, shipmentCount] = await Promise.all([
        this.prisma.incomingInspectionDefect.count({ where: { defectTypeId } }),
        this.prisma.processInspectionDefect.count({ where: { defectTypeId } }),
        this.prisma.shipmentInspectionDefect.count({ where: { defectTypeId } })
      ]);

      return incomingCount + processCount + shipmentCount;
    } catch (error) {
      this.logger.error(`Failed to check defect type usage for id ${defectTypeId}`, error);
      throw error;
    }
  }
} 