import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RecentInspectionsQueryDto } from '../dto/recent-inspections-query.dto';
import { UnifiedInspectionResponseDto } from '../dto/unified-inspection-response.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UnifiedInspectionService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecentInspections(query: RecentInspectionsQueryDto) {
    const { orderNumber, productName, partName, type, limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    // 공통 where 조건 구성
    const buildWhereCondition = () => {
      const where: any = {};

      if (orderNumber) {
        where.orderNumbers = {
          hasSome: [orderNumber]
        };
      }

      if (productName) {
        where.productName = {
          contains: productName,
          mode: 'insensitive'
        };
      }

      if (partName) {
        where.partName = {
          contains: partName,
          mode: 'insensitive'
        };
      }

      return where;
    };

    const whereCondition = buildWhereCondition();

    // 공통 include 조건
    const includeCondition = {
      defects: {
        include: {
          defectType: true
        }
      },
      attachments: true
    };

    let results: any[] = [];
    let totalCount = 0;

    if (!type || type === 'incoming') {
      const [incomingInspections, incomingCount] = await Promise.all([
        this.prisma.incomingInspection.findMany({
          where: whereCondition,
          include: includeCondition,
          orderBy: { inspectionDate: 'desc' },
          skip: type === 'incoming' ? skip : 0,
          take: type === 'incoming' ? limit : undefined
        }),
        this.prisma.incomingInspection.count({ where: whereCondition })
      ]);

      const mappedIncoming = incomingInspections.map(inspection => ({
        ...inspection,
        type: 'incoming' as const
      }));

      if (type === 'incoming') {
        results = mappedIncoming;
        totalCount = incomingCount;
      } else {
        results.push(...mappedIncoming);
        totalCount += incomingCount;
      }
    }

    if (!type || type === 'process') {
      const [processInspections, processCount] = await Promise.all([
        this.prisma.processInspection.findMany({
          where: whereCondition,
          include: {
            ...includeCondition,
            rounds: true
          },
          orderBy: { inspectionDate: 'desc' },
          skip: type === 'process' ? skip : 0,
          take: type === 'process' ? limit : undefined
        }),
        this.prisma.processInspection.count({ where: whereCondition })
      ]);

      const mappedProcess = processInspections.map(inspection => ({
        ...inspection,
        type: 'process' as const
      }));

      if (type === 'process') {
        results = mappedProcess;
        totalCount = processCount;
      } else {
        results.push(...mappedProcess);
        totalCount += processCount;
      }
    }

    if (!type || type === 'shipment') {
      const [shipmentInspections, shipmentCount] = await Promise.all([
        this.prisma.shipmentInspection.findMany({
          where: whereCondition,
          include: {
            ...includeCondition,
            rounds: {
              include: {
                workers: {
                  include: {
                    defects: {
                      include: {
                        defectType: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { inspectionDate: 'desc' },
          skip: type === 'shipment' ? skip : 0,
          take: type === 'shipment' ? limit : undefined
        }),
        this.prisma.shipmentInspection.count({ where: whereCondition })
      ]);

      const mappedShipment = shipmentInspections.map(inspection => ({
        ...inspection,
        type: 'shipment' as const
      }));

      if (type === 'shipment') {
        results = mappedShipment;
        totalCount = shipmentCount;
      } else {
        results.push(...mappedShipment);
        totalCount += shipmentCount;
      }
    }

    // 전체 검사 유형을 조회하는 경우 날짜순으로 정렬하고 페이지네이션 적용
    if (!type) {
      results.sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime());
      const paginatedResults = results.slice(skip, skip + limit);
      results = paginatedResults;
    }

    // DTO로 변환
    const transformedResults = results.map(inspection => 
      plainToClass(UnifiedInspectionResponseDto, inspection, { excludeExtraneousValues: true })
    );

    return {
      data: transformedResults,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  async getInspectionById(id: number, type: 'incoming' | 'process' | 'shipment') {
    let inspection: any;

    switch (type) {
      case 'incoming':
        inspection = await this.prisma.incomingInspection.findUnique({
          where: { id },
          include: {
            defects: {
              include: {
                defectType: true
              }
            },
            attachments: true
          }
        });
        break;

      case 'process':
        inspection = await this.prisma.processInspection.findUnique({
          where: { id },
          include: {
            defects: {
              include: {
                defectType: true
              }
            },
            attachments: true,
            rounds: true
          }
        });
        break;

      case 'shipment':
        inspection = await this.prisma.shipmentInspection.findUnique({
          where: { id },
          include: {
            attachments: true,
            rounds: {
              include: {
                workers: {
                  include: {
                    defects: {
                      include: {
                        defectType: true
                      }
                    }
                  }
                }
              }
            }
          }
        });
        break;
    }

    if (!inspection) {
      return null;
    }

    // 출하검사의 경우 defects를 rounds.workers.defects에서 추출
    if (type === 'shipment') {
      const allDefects = inspection.rounds.flatMap((round: any) => 
        round.workers.flatMap((worker: any) => worker.defects)
      );
      inspection.defects = allDefects;
    }

    return plainToClass(UnifiedInspectionResponseDto, {
      ...inspection,
      type
    }, { excludeExtraneousValues: true });
  }
}