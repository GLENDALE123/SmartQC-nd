import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateIncomingInspectionDto } from '../dto/create-incoming-inspection.dto';
import { UpdateIncomingInspectionDto } from '../dto/update-incoming-inspection.dto';
import { SharedFolderService } from './shared-folder.service';

@Injectable()
export class IncomingInspectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sharedFolderService: SharedFolderService,
  ) {}

  async create(dto: CreateIncomingInspectionDto) {
    const { defects, attachments, ...rest } = dto;

    // orderNumbers 기반으로 검사 생성 (batchId 로직 제거)
    const inspection = await this.prisma.incomingInspection.create({
      data: {
        // 주문 정보 직접 저장
        orderNumbers: dto.orderNumbers,
        client: dto.client,
        productName: dto.productName,
        partName: dto.partName,
        specification: dto.specification,
        manager: dto.manager,
        // 검사 데이터
        inspectionDate: new Date(dto.inspectionDate),
        totalQty: dto.totalQty,
        defectQty: dto.defectQty,
        notes: dto.notes,
        defects: {
          create:
            defects?.map((d) => ({
              defectTypeId: d.defectTypeId,
              customType: d.customType,
              count: d.count,
              details: d.details,
            })) || [],
        },
      },
      include: {
        defects: {
          include: {
            defectType: true,
          },
        },
        attachments: true,
      },
    });

    // 파일 업로드 처리 로직 유지
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.file) {
          await this.sharedFolderService.uploadImageWithInspectionId(
            attachment.file,
            inspection.id,
            'incoming',
          );
        }
      }
    }

    return inspection;
  }

  async findAll() {
    return this.prisma.incomingInspection.findMany({
      include: {
        defects: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const inspection = await this.prisma.incomingInspection.findUnique({
      where: { id },
      include: {
        defects: true,
      },
    });
    if (!inspection)
      throw new NotFoundException('수입검사 내역을 찾을 수 없습니다.');
    return inspection;
  }

  async update(id: number, dto: UpdateIncomingInspectionDto) {
    // 기존 defects 삭제 후 재생성 (attachments는 유지)
    await this.prisma.incomingInspectionDefect.deleteMany({
      where: { inspectionId: id },
    });
    const { defects, attachments, ...rest } = dto;

    const updateData: any = {};

    // 주문 정보 업데이트 (orderNumbers 기반)
    if (dto.orderNumbers !== undefined)
      updateData.orderNumbers = dto.orderNumbers;
    if (dto.client !== undefined) updateData.client = dto.client;
    if (dto.productName !== undefined) updateData.productName = dto.productName;
    if (dto.partName !== undefined) updateData.partName = dto.partName;
    if (dto.specification !== undefined)
      updateData.specification = dto.specification;
    if (dto.manager !== undefined) updateData.manager = dto.manager;

    // 검사 데이터 업데이트
    if (dto.inspectionDate !== undefined)
      updateData.inspectionDate = new Date(dto.inspectionDate);
    if (dto.totalQty !== undefined) updateData.totalQty = dto.totalQty;
    if (dto.defectQty !== undefined) updateData.defectQty = dto.defectQty;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    // defects 재생성
    if (defects) {
      updateData.defects = {
        create: defects.map((d) => ({
          defectTypeId: d.defectTypeId,
          customType: d.customType,
          count: d.count,
          details: d.details,
        })),
      };
    }

    const inspection = await this.prisma.incomingInspection.update({
      where: { id },
      data: updateData,
      include: {
        defects: {
          include: {
            defectType: true,
          },
        },
        attachments: true,
      },
    });

    // 파일 업로드 처리 로직 유지
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.file) {
          await this.sharedFolderService.uploadImageWithInspectionId(
            attachment.file,
            inspection.id,
            'incoming',
          );
        }
      }
    }

    return inspection;
  }

  async remove(id: number) {
    // 먼저 검사 폴더 삭제
    await this.sharedFolderService.deleteInspectionFolder(id);

    // DB에서 관련 데이터 삭제
    await this.prisma.incomingInspectionDefect.deleteMany({
      where: { inspectionId: id },
    });
    await this.prisma.attachment.deleteMany({
      where: { incomingInspectionId: id },
    });
    return this.prisma.incomingInspection.delete({ where: { id } });
  }

  async getReferences(params: {
    orderNumbers?: string[];
    orderNumber?: string;
    productName?: string;
    partName?: string;
    client?: string;
  }) {
    const whereConditions: any = {};

    // orderNumbers 배열 또는 단일 orderNumber 처리
    const orderNumbersToSearch: string[] = [];
    if (params.orderNumbers && params.orderNumbers.length > 0) {
      orderNumbersToSearch.push(...params.orderNumbers);
    }
    if (params.orderNumber) {
      orderNumbersToSearch.push(params.orderNumber);
    }

    // orderNumbers가 있으면 해당 발주번호들과 겹치는 검사들 조회
    if (orderNumbersToSearch.length > 0) {
      whereConditions.orderNumbers = {
        hasSome: orderNumbersToSearch,
      };
    }

    // 제품명, 부속명, 발주처로 필터링
    if (params.productName) {
      whereConditions.productName = {
        contains: params.productName,
        mode: 'insensitive',
      };
    }

    if (params.partName) {
      whereConditions.partName = {
        contains: params.partName,
        mode: 'insensitive',
      };
    }

    if (params.client) {
      whereConditions.client = {
        contains: params.client,
        mode: 'insensitive',
      };
    }

    return this.prisma.incomingInspection.findMany({
      where: whereConditions,
      include: {
        defects: {
          include: {
            defectType: true,
          },
        },
      },
      orderBy: { inspectionDate: 'desc' },
      take: 10, // 최대 10개까지 참고 이력 조회
    });
  }
}
