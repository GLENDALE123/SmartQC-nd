import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateShipmentInspectionDto } from '../dto/create-shipment-inspection.dto';
import { UpdateShipmentInspectionDto } from '../dto/update-shipment-inspection.dto';
import { SharedFolderService } from './shared-folder.service';

@Injectable()
export class ShipmentInspectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sharedFolderService: SharedFolderService,
  ) {}

  async create(dto: CreateShipmentInspectionDto) {
    const { rounds, attachments, ...rest } = dto;
    const inspection = await this.prisma.shipmentInspection.create({
      data: {
        ...rest,
        inspectionDate: new Date(rest.inspectionDate),
        rounds: {
          create:
            rounds?.map((r) => ({
              date: new Date(r.date),
              qty: r.qty,
              defectQty: r.defectQty,
              workers: {
                create:
                  r.workers?.map((w) => ({
                    name: w.name,
                    defects: {
                      create:
                        w.defects?.map((d) => ({
                          defectTypeId: d.defectTypeId,
                          customType: d.customType,
                          count: d.count,
                          details: d.details,
                        })) || [],
                    },
                  })) || [],
              },
            })) || [],
        },
        // 이미지(attachment)는 별도 업로드로 처리
      },
      include: {
        rounds: {
          include: {
            workers: {
              include: {
                defects: {
                  include: {
                    defectType: true,
                  },
                },
              },
            },
          },
        },
        attachments: true,
      },
    });

    // 이미지 처리 (검사 ID가 생성된 후)
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.file) {
          await this.sharedFolderService.uploadImageWithInspectionId(
            attachment.file,
            inspection.id,
            'shipment',
          );
        }
      }
    }

    return inspection;
  }

  async findAll() {
    return this.prisma.shipmentInspection.findMany({
      include: {
        rounds: {
          include: {
            workers: {
              include: {
                defects: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const inspection = await this.prisma.shipmentInspection.findUnique({
      where: { id },
      include: {
        rounds: {
          include: {
            workers: {
              include: {
                defects: true,
              },
            },
          },
        },
      },
    });
    if (!inspection)
      throw new NotFoundException('출하검사 내역을 찾을 수 없습니다.');
    return inspection;
  }

  async update(id: number, dto: UpdateShipmentInspectionDto) {
    // 중첩 구조 모두 삭제 후 재생성 (attachments는 유지)
    await this.prisma.shipmentInspectionRound.deleteMany({
      where: { inspectionId: id },
    });
    const { rounds, attachments, ...rest } = dto;
    // undefined/null 필드 제거
    const cleanData = Object.fromEntries(
      Object.entries(rest).filter(([_, v]) => v !== undefined && v !== null),
    );
    const inspection = await this.prisma.shipmentInspection.update({
      where: { id },
      data: {
        ...cleanData,
        rounds: {
          create:
            rounds?.map((r) => ({
              date: r.date,
              qty: r.qty,
              defectQty: r.defectQty,
              workers: {
                create:
                  r.workers?.map((w) => ({
                    name: w.name,
                    defects: {
                      create:
                        w.defects?.map((d) => ({
                          defectTypeId: d.defectTypeId,
                          customType: d.customType,
                          count: d.count,
                          details: d.details,
                        })) || [],
                    },
                  })) || [],
              },
            })) || [],
        },
        // attachments는 기존 것을 유지 (이미지는 별도로 관리)
      },
      include: {
        rounds: {
          include: {
            workers: {
              include: {
                defects: true,
              },
            },
          },
        },
      },
    });
    return inspection;
  }

  async remove(id: number) {
    // 먼저 검사 폴더 삭제
    await this.sharedFolderService.deleteInspectionFolder(id);

    // DB에서 관련 데이터 삭제
    await this.prisma.shipmentInspectionRound.deleteMany({
      where: { inspectionId: id },
    });
    await this.prisma.attachment.deleteMany({
      where: { shipmentInspectionId: id },
    });
    return this.prisma.shipmentInspection.delete({ where: { id } });
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

    return this.prisma.shipmentInspection.findMany({
      where: whereConditions,
      include: {
        rounds: {
          include: {
            workers: {
              include: {
                defects: {
                  include: {
                    defectType: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { inspectionDate: 'desc' },
      take: 10, // 최대 10개까지 참고 이력 조회
    });
  }
}
