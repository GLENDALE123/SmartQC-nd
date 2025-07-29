import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UploadLogService {
  constructor(private prisma: PrismaService) {}

  async createLog(params: {
    userId?: number;
    fileName: string;
    successCount: number;
    failedCount: number;
    results: any;
  }) {
    return this.prisma.uploadLog.create({
      data: {
        userId: params.userId,
        fileName: params.fileName,
        successCount: params.successCount,
        failedCount: params.failedCount,
        results: params.results,
      },
    });
  }

  async getLogDetail(id: number) {
    return this.prisma.uploadLog.findUnique({ where: { id } });
  }

  async getLogs(params: {
    limit: number;
    offset: number;
    userId?: number;
    keyword?: string;
    from?: string;
    to?: string;
  }) {
    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.keyword) where.fileName = { contains: params.keyword };
    if (params.from || params.to) {
      where.createdAt = {};
      if (params.from) where.createdAt.gte = new Date(params.from);
      if (params.to) where.createdAt.lte = new Date(params.to + 'T23:59:59');
    }
    const [logs, total] = await this.prisma.$transaction([
      this.prisma.uploadLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: params.offset,
        take: params.limit,
      }),
      this.prisma.uploadLog.count({ where }),
    ]);
    return { logs, total, limit: params.limit, offset: params.offset };
  }
}
