import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProcessInspectionDto } from '../dto/create-process-inspection.dto';
import { UpdateProcessInspectionDto } from '../dto/update-process-inspection.dto';
import { SharedFolderService } from './shared-folder.service';

@Injectable()
export class ProcessInspectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sharedFolderService: SharedFolderService,
  ) {}

  async create(dto: CreateProcessInspectionDto) {
    const { defects, attachments, rounds, ...rest } = dto;

    // orderNumbers 기반으로 검사 생성 (batchId 로직 제거)
    const inspection = await this.prisma.processInspection.create({
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
        // 공정검사 특화 필드들 처리 유지
        paintPrimer: dto.paintPrimer,
        paintTopcoat: dto.paintTopcoat,
        line: dto.line,
        subLine: dto.subLine,
        peelingTest: dto.peelingTest,
        colorDiff: dto.colorDiff,
        extraWork: dto.extraWork,
        lineSpeed: dto.lineSpeed,
        spindleRatio: dto.spindleRatio,
        uvCond: dto.uvCond,
        irCond: dto.irCond,
        jig: dto.jig,
        injectionPack: dto.injectionPack,
        afterPack: dto.afterPack,
        // rounds 데이터 생성 로직 유지
        rounds: {
          create:
            rounds?.map((r) => ({
              label: r.label,
              qty: r.qty,
            })) || [],
        },
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
        rounds: true,
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
            'process',
          );
        }
      }
    }

    return inspection;
  }

  async findAll() {
    return this.prisma.processInspection.findMany({
      include: {
        rounds: true,
        defects: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const inspection = await this.prisma.processInspection.findUnique({
      where: { id },
      include: {
        rounds: true,
        defects: true,
      },
    });
    if (!inspection)
      throw new NotFoundException('공정검사 내역을 찾을 수 없습니다.');
    return inspection;
  }

  async update(id: number, dto: UpdateProcessInspectionDto) {
    // 기존 rounds와 defects 삭제 후 재생성 (attachments는 유지)
    await this.prisma.processInspectionRound.deleteMany({
      where: { inspectionId: id },
    });
    await this.prisma.processInspectionDefect.deleteMany({
      where: { inspectionId: id },
    });
    const { defects, attachments, rounds, ...rest } = dto;

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

    // 공정검사 특화 필드들 처리 유지
    if (dto.paintPrimer !== undefined) updateData.paintPrimer = dto.paintPrimer;
    if (dto.paintTopcoat !== undefined)
      updateData.paintTopcoat = dto.paintTopcoat;
    if (dto.line !== undefined) updateData.line = dto.line;
    if (dto.subLine !== undefined) updateData.subLine = dto.subLine;
    if (dto.peelingTest !== undefined) updateData.peelingTest = dto.peelingTest;
    if (dto.colorDiff !== undefined) updateData.colorDiff = dto.colorDiff;
    if (dto.extraWork !== undefined) updateData.extraWork = dto.extraWork;
    if (dto.lineSpeed !== undefined) updateData.lineSpeed = dto.lineSpeed;
    if (dto.spindleRatio !== undefined)
      updateData.spindleRatio = dto.spindleRatio;
    if (dto.uvCond !== undefined) updateData.uvCond = dto.uvCond;
    if (dto.irCond !== undefined) updateData.irCond = dto.irCond;
    if (dto.jig !== undefined) updateData.jig = dto.jig;
    if (dto.injectionPack !== undefined)
      updateData.injectionPack = dto.injectionPack;
    if (dto.afterPack !== undefined) updateData.afterPack = dto.afterPack;

    // rounds 재생성
    if (rounds) {
      updateData.rounds = {
        create: rounds.map((r) => ({
          label: r.label,
          qty: r.qty,
        })),
      };
    }

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

    const inspection = await this.prisma.processInspection.update({
      where: { id },
      data: updateData,
      include: {
        rounds: true,
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
            'process',
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
    await this.prisma.processInspectionRound.deleteMany({
      where: { inspectionId: id },
    });
    await this.prisma.processInspectionDefect.deleteMany({
      where: { inspectionId: id },
    });
    await this.prisma.attachment.deleteMany({
      where: { processInspectionId: id },
    });
    return this.prisma.processInspection.delete({ where: { id } });
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

    return this.prisma.processInspection.findMany({
      where: whereConditions,
      include: {
        rounds: true,
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
