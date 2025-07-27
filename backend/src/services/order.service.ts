import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrderInfoResponseDto } from '../dto/order-info-response.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 기존 데이터와 새로운 데이터를 비교하여 변경사항이 있는지 확인
   */
  private hasDataChanges(existingOrder: any, newData: any): boolean {
    // 비교할 필드들 (id, createdAt, updatedAt 제외)
    const fieldsToCompare = [
      'year', 'month', 'day', 'category', 'finalorderNumber', 'orderNumber', 
      'code', 'registration', 'col2', 'customer', 'productName', 'partName',
      'quantity', 'specification', 'postProcess', 'production', 'remaining',
      'status', 'sample', 'shippingDate', 'dDay', 'manager', 'shipping',
      'jig', 'registration2', 'category2', 'unitPrice', 'orderAmount',
      'etc', 'category3', 'salesManager'
    ];

    for (const field of fieldsToCompare) {
      const existingValue = existingOrder[field];
      const newValue = newData[field];
      
      // null/undefined 정규화
      const normalizedExisting = existingValue === null || existingValue === undefined ? null : existingValue;
      const normalizedNew = newValue === null || newValue === undefined ? null : newValue;
      
      if (normalizedExisting !== normalizedNew) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 발주번호 형식 검증 (orderNumber 필드 기반)
   * 일반적인 발주번호 형식: T00000-1, T12345-6 등
   * 데이터베이스의 orderNumber 필드 패턴을 기반으로 검증
   */
  private validateOrderNumberFormat(orderNumber: string): boolean {
    if (!orderNumber || typeof orderNumber !== 'string') {
      return false;
    }

    const trimmed = orderNumber.trim();
    
    // 빈 문자열 체크
    if (trimmed.length === 0) {
      return false;
    }

    // 길이 제한 (너무 긴 문자열 방지)
    if (trimmed.length > 50) {
      return false;
    }

    // 기본적인 형식 검증 (영문자로 시작하고 숫자와 하이픈 포함)
    // 예: T00000-1, ABC123-4, etc.
    const orderNumberPattern = /^[A-Za-z][A-Za-z0-9]*-[0-9]+$/;
    
    // 단순 문자열 패턴 (일부 발주번호는 하이픈이 없을 수 있음)
    const simplePattern = /^[A-Za-z0-9]+$/;
    
    // 특수문자 제한 (SQL 인젝션 방지)
    const hasInvalidChars = /[<>'";&|`$(){}[\]\\]/.test(trimmed);
    if (hasInvalidChars) {
      return false;
    }
    
    return orderNumberPattern.test(trimmed) || simplePattern.test(trimmed);
  }

  /**
   * 발주번호 배열 정규화 및 검증
   */
  private normalizeAndValidateOrderNumbers(orderNumbers: string[]): string[] {
    if (!orderNumbers || orderNumbers.length === 0) {
      return [];
    }

    const validOrderNumbers = orderNumbers
      .filter(orderNumber => orderNumber && typeof orderNumber === 'string')
      .map(orderNumber => orderNumber.trim())
      .filter(orderNumber => orderNumber.length > 0 && this.validateOrderNumberFormat(orderNumber))
      // 중복 제거
      .filter((orderNumber, index, array) => array.indexOf(orderNumber) === index);

    return validOrderNumbers;
  }

  async searchByOrderNumbers(orderNumbers: string[]): Promise<OrderInfoResponseDto[]> {
    if (!orderNumbers || orderNumbers.length === 0) {
      return [];
    }

    // 발주번호 형식 검증 및 정규화
    const validOrderNumbers = this.normalizeAndValidateOrderNumbers(orderNumbers);

    if (validOrderNumbers.length === 0) {
      return [];
    }

    // 성능 최적화: 배치 크기 제한 (대용량 쿼리 방지)
    const BATCH_SIZE = 100;
    if (validOrderNumbers.length > BATCH_SIZE) {
      // 배치 단위로 분할하여 처리
      const batches: string[][] = [];
      for (let i = 0; i < validOrderNumbers.length; i += BATCH_SIZE) {
        batches.push(validOrderNumbers.slice(i, i + BATCH_SIZE));
      }

      // 병렬 처리로 성능 향상
      const batchResults = await Promise.all(
        batches.map(batch => this.searchByOrderNumbers(batch))
      );

      // 결과 병합 및 중복 제거
      const allOrders = batchResults.flat();
      const uniqueOrders = new Map<number, OrderInfoResponseDto>();
      
      allOrders.forEach(order => {
        uniqueOrders.set(order.col0, order);
      });

      return Array.from(uniqueOrders.values()).sort((a, b) => {
        // 최신 순으로 정렬
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return b.col0 - a.col0;
      });
    }

    // 성능 최적화: finalorderNumber 필드 인덱스를 활용한 효율적인 쿼리
    // finalorderNumber는 orderNumber(T00000)와 code(1)의 조합 (T00000-1)
    const orders = await this.prisma.order.findMany({
      where: {
        finalorderNumber: { in: validOrderNumbers }
      },
      select: {
        col0: true,
        year: true,
        month: true,
        day: true,
        code: true,
        category: true,
        orderNumber: true,
        finalorderNumber: true,
        customer: true,
        productName: true,
        partName: true,
        specification: true,
        manager: true,
        quantity: true,
        production: true,
        remaining: true,
        status: true,
        shippingDate: true,
        dDay: true,
        unitPrice: true,
        orderAmount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { createdAt: 'desc' },
        { col0: 'desc' } // 보조 정렬 기준
      ]
    });

    // DTO 변환 최적화 (직접 매핑으로 성능 향상)
    return orders.map(order => this.mapToOrderInfoResponseDto(order));
  }

  /**
   * Order 엔티티를 OrderInfoResponseDto로 변환하는 최적화된 매핑 함수
   */
  private mapToOrderInfoResponseDto(order: any): OrderInfoResponseDto {
    return {
      col0: order.col0,
      year: order.year,
      month: order.month,
      day: order.day,
      category: order.category,
      code: order.code,
      orderNumber: order.orderNumber,
      finalorderNumber: order.finalorderNumber,
      customer: order.customer,
      productName: order.productName,
      partName: order.partName,
      specification: order.specification,
      manager: order.manager,
      quantity: order.quantity,
      production: order.production,
      remaining: order.remaining,
      status: order.status,
      shippingDate: order.shippingDate,
      dDay: order.dDay,
      unitPrice: order.unitPrice,
      orderAmount: order.orderAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderInfoResponseDto | null> {
    if (!orderNumber || typeof orderNumber !== 'string') {
      return null;
    }

    const trimmedOrderNumber = orderNumber.trim();
    
    // 발주번호 형식 검증
    if (!this.validateOrderNumberFormat(trimmedOrderNumber)) {
      return null;
    }

    const order = await this.prisma.order.findFirst({
      where: {
        finalorderNumber: trimmedOrderNumber
      },
      select: {
        col0: true,
        year: true,
        month: true,
        day: true,
        category: true,
        code: true,
        orderNumber: true,
        finalorderNumber: true,
        customer: true,
        productName: true,
        partName: true,
        specification: true,
        manager: true,
        quantity: true,
        production: true,
        remaining: true,
        status: true,
        shippingDate: true,
        dDay: true,
        unitPrice: true,
        orderAmount: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!order) {
      return null;
    }

    // 최적화된 매핑 함수 사용
    return this.mapToOrderInfoResponseDto(order);
  }

  async findMissingOrderNumbers(orderNumbers: string[]): Promise<string[]> {
    if (!orderNumbers || orderNumbers.length === 0) {
      return [];
    }

    // 동일한 검증 로직 사용
    const validOrderNumbers = this.normalizeAndValidateOrderNumbers(orderNumbers);

    if (validOrderNumbers.length === 0) {
      // 모든 발주번호가 유효하지 않은 경우, 원본 배열 반환
      return orderNumbers.filter(orderNumber => 
        orderNumber && typeof orderNumber === 'string' && orderNumber.trim().length > 0
      );
    }

    // 성능 최적화: 배치 크기 제한 (대용량 쿼리 방지)
    const BATCH_SIZE = 100;
    if (validOrderNumbers.length > BATCH_SIZE) {
      // 배치 단위로 분할하여 처리
      const batches: string[][] = [];
      for (let i = 0; i < validOrderNumbers.length; i += BATCH_SIZE) {
        batches.push(validOrderNumbers.slice(i, i + BATCH_SIZE));
      }

      // 병렬 처리로 성능 향상
      const batchResults = await Promise.all(
        batches.map(batch => this.findMissingOrderNumbers(batch))
      );

      // 결과 병합 및 중복 제거
      const allMissingNumbers = batchResults.flat();
      return Array.from(new Set(allMissingNumbers));
    }

    // 성능 최적화: 필요한 필드만 선택하여 네트워크 트래픽 최소화
    const existingOrders = await this.prisma.order.findMany({
      where: {
        finalorderNumber: { in: validOrderNumbers }
      },
      select: {
        finalorderNumber: true,
      }
    });

    // Set을 사용하여 O(1) 조회 성능 확보
    const foundOrderNumbers = new Set<string>();
    existingOrders.forEach(order => {
      if (order.finalorderNumber) foundOrderNumbers.add(order.finalorderNumber);
    });

    // 존재하지 않는 발주번호만 반환
    return validOrderNumbers.filter(orderNumber => !foundOrderNumbers.has(orderNumber));
  }

  /**
   * 발주번호 존재 여부를 효율적으로 확인하는 메서드
   * 대용량 발주번호 배열에 대한 존재 여부 확인 최적화
   */
  async checkOrderNumbersExistence(orderNumbers: string[]): Promise<{
    existing: string[];
    missing: string[];
    invalid: string[];
  }> {
    if (!orderNumbers || orderNumbers.length === 0) {
      return { existing: [], missing: [], invalid: [] };
    }

    // 원본 발주번호 배열 보존
    const originalOrderNumbers = orderNumbers.map(orderNumber => 
      orderNumber && typeof orderNumber === 'string' ? orderNumber.trim() : orderNumber
    );

    // 유효한 발주번호만 추출
    const validOrderNumbers = this.normalizeAndValidateOrderNumbers(orderNumbers);

    // 유효하지 않은 발주번호 식별
    const invalidOrderNumbers = originalOrderNumbers.filter(orderNumber => 
      orderNumber && 
      typeof orderNumber === 'string' && 
      orderNumber.trim().length > 0 &&
      !validOrderNumbers.includes(orderNumber.trim())
    );

    if (validOrderNumbers.length === 0) {
      return {
        existing: [],
        missing: [],
        invalid: invalidOrderNumbers
      };
    }

    // 존재하는 발주번호 조회
    const existingOrders = await this.prisma.order.findMany({
      where: {
        finalorderNumber: { in: validOrderNumbers }
      },
      select: {
        finalorderNumber: true,
      }
    });

    // 존재하는 발주번호 Set 생성
    const foundOrderNumbers = new Set<string>();
    existingOrders.forEach(order => {
      if (order.finalorderNumber) foundOrderNumbers.add(order.finalorderNumber);
    });

    // 결과 분류
    const existingOrderNumbers = validOrderNumbers.filter(orderNumber => 
      foundOrderNumbers.has(orderNumber)
    );
    const missingOrderNumbers = validOrderNumbers.filter(orderNumber => 
      !foundOrderNumbers.has(orderNumber)
    );

    return {
      existing: existingOrderNumbers,
      missing: missingOrderNumbers,
      invalid: invalidOrderNumbers
    };
  }

  /**
   * 데이터 크기에 따른 최적 배치 크기 계산
   */
  private calculateOptimalBatchSize(dataLength: number): number {
    if (dataLength < 1000) {
      return 100;    // 소규모: 100개씩
    } else if (dataLength < 5000) {
      return 250;    // 중간 규모: 250개씩
    } else if (dataLength < 10000) {
      return 500;    // 대규모: 500개씩
    } else {
      return 1000;   // 초대규모: 1000개씩
    }
  }

  /**
   * 메모리 효율적인 청크 처리
   */
  private async processInChunks<T>(
    data: T[],
    chunkSize: number,
    processor: (chunk: T[]) => Promise<void>
  ): Promise<void> {
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await processor(chunk);
      
      // 메모리 정리를 위한 가비지 컬렉션 힌트
      if (global.gc && i % (chunkSize * 5) === 0) {
        global.gc();
      }
    }
  }

  /**
   * 진행률 콜백을 지원하는 대량 주문 생성 메서드 (최적화됨)
   */
  async bulkCreateOrdersWithProgress(
    ordersData: any[],
    progressCallback?: (progress: number, processedRows: number, currentBatch?: number, totalBatches?: number) => void
  ): Promise<{
    success: number;
    fail: number;
    details: {
      created: number;
      updated: number;
      skipped: number;
    };
    created: OrderInfoResponseDto[];
  }> {
    if (!ordersData || ordersData.length === 0) {
      return {
        success: 0,
        fail: 0,
        details: {
          created: 0,
          updated: 0,
          skipped: 0
        },
        created: []
      };
    }

    const errors: Array<{ row: number; error: string; data?: any }> = [];
    const validOrders: Array<{ data: any; originalIndex: number }> = [];

    // 1. 데이터 검증 및 전처리 (진행률: 0-20%)
    for (let i = 0; i < ordersData.length; i++) {
      const orderData = ordersData[i];
      
      // 진행률 업데이트
      if (progressCallback && i % 100 === 0) {
        const progress = (i / ordersData.length) * 20;
        progressCallback(progress, i);
      }
      
      try {
        // 필수 필드 검증
        if (!orderData.col0 || typeof orderData.col0 !== 'number') {
          errors.push({
            row: i + 1,
            error: 'col0 필드가 누락되었거나 유효하지 않습니다.',
            data: orderData
          });
          continue;
        }

        // finalorderNumber 검증 (있는 경우)
        if (orderData.finalorderNumber && !this.validateOrderNumberFormat(orderData.finalorderNumber)) {
          errors.push({
            row: i + 1,
            error: '발주번호 형식이 유효하지 않습니다.',
            data: orderData
          });
          continue;
        }

        // 숫자 필드 검증 및 변환
        const numericFields = ['year', 'month', 'day', 'quantity', 'production', 'remaining', 'unitPrice', 'orderAmount'];
        const processedData = { ...orderData };

        for (const field of numericFields) {
          if (processedData[field] !== undefined && processedData[field] !== null) {
            const numValue = Number(processedData[field]);
            if (isNaN(numValue)) {
              processedData[field] = null;
            } else {
              processedData[field] = numValue;
            }
          }
        }

        // 문자열 필드 정리
        const stringFields = [
          'category', 'finalorderNumber', 'orderNumber', 'code', 'registration',
          'col2', 'customer', 'productName', 'partName', 'specification',
          'postProcess', 'status', 'sample', 'shippingDate', 'dDay',
          'manager', 'shipping', 'jig', 'registration2', 'category2',
          'etc', 'category3', 'salesManager'
        ];

        for (const field of stringFields) {
          if (processedData[field] !== undefined && processedData[field] !== null) {
            processedData[field] = String(processedData[field]).trim();
            if (processedData[field] === '') {
              processedData[field] = null;
            }
          }
        }

        validOrders.push({
          data: processedData,
          originalIndex: i
        });

      } catch (error) {
        errors.push({
          row: i + 1,
          error: `데이터 검증 중 오류가 발생했습니다 - ${error.message}`
        });
      }
    }

    if (progressCallback) {
      progressCallback(20, ordersData.length);
    }

    if (validOrders.length === 0) {
      return {
        success: 0,
        fail: ordersData.length,
        details: {
          created: 0,
          updated: 0,
          skipped: 0
        },
        created: []
      };
    }

    // 2. 중복 검사 및 업데이트/스킵 분류 (진행률: 20-30%)
    const col0Values = validOrders.map(order => order.data.col0);
    const existingOrders = await this.prisma.order.findMany({
      where: {
        col0: { in: col0Values }
      }
    });

    if (progressCallback) {
      progressCallback(30, ordersData.length);
    }

    const existingOrdersMap = new Map(existingOrders.map(order => [order.col0, order]));
    const ordersToCreate: Array<{ data: any; originalIndex: number }> = [];
    const ordersToUpdate: Array<{ data: any; originalIndex: number }> = [];
    let skippedCount = 0;

    for (const order of validOrders) {
      const existingOrder = existingOrdersMap.get(order.data.col0);
      
      if (!existingOrder) {
        ordersToCreate.push(order);
      } else {
        const hasChanges = this.hasDataChanges(existingOrder, order.data);
        
        if (hasChanges) {
          ordersToUpdate.push(order);
        } else {
          skippedCount++;
        }
      }
    }

    // 3. 배치 처리로 대량 생성 및 업데이트 (진행률: 30-90%) - 최적화됨
    const BATCH_SIZE = this.calculateOptimalBatchSize(ordersData.length);
    
    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    const processedOrders: OrderInfoResponseDto[] = [];

    const totalBatches = Math.ceil((ordersToCreate.length + ordersToUpdate.length) / BATCH_SIZE);
    let currentBatch = 0;

    // 3-1. 새로운 데이터 생성 (메모리 효율적 처리)
    if (ordersToCreate.length > 0) {
      await this.processInChunks(
        ordersToCreate,
        BATCH_SIZE,
        async (batch) => {
          currentBatch++;
          
          try {
            // 트랜잭션 타임아웃을 배치 크기에 따라 동적 조정
            const timeoutMs = Math.max(30000, BATCH_SIZE * 50);
            
            await this.prisma.$transaction(async (tx) => {
              const createData = batch.map(order => ({
                ...order.data,
                createdAt: new Date(),
                updatedAt: new Date()
              }));

              await tx.order.createMany({
                data: createData,
                skipDuplicates: true
              });

              createdCount += batch.length;
            }, { timeout: timeoutMs });
            
          } catch (batchError) {
            
            // 배치 실패 시 개별 처리 (복원력 향상)
            for (const order of batch) {
              try {
                await this.prisma.order.create({
                  data: {
                    ...order.data,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                });
                createdCount++;
              } catch (individualError) {
                failedCount++;
              }
            }
          }
          
          // 진행률 업데이트
          if (progressCallback) {
            const batchProgress = 30 + ((currentBatch / totalBatches) * 60);
            const processedRows = createdCount + updatedCount + skippedCount;
            progressCallback(batchProgress, processedRows, currentBatch, totalBatches);
          }
        }
      );
    }

    // 3-2. 기존 데이터 업데이트 (메모리 효율적 처리)
    if (ordersToUpdate.length > 0) {
      await this.processInChunks(
        ordersToUpdate,
        BATCH_SIZE,
        async (batch) => {
          currentBatch++;
          
          try {
            // 배치 업데이트를 위한 트랜잭션
            const timeoutMs = Math.max(30000, BATCH_SIZE * 50);
            
            await this.prisma.$transaction(async (tx) => {
              for (const order of batch) {
                await tx.order.update({
                  where: { col0: order.data.col0 },
                  data: {
                    ...order.data,
                    updatedAt: new Date()
                  }
                });
                updatedCount++;
              }
            }, { timeout: timeoutMs });
            
          } catch (batchError) {
            
            // 배치 실패 시 개별 처리
            for (const order of batch) {
              try {
                await this.prisma.order.update({
                  where: { col0: order.data.col0 },
                  data: {
                    ...order.data,
                    updatedAt: new Date()
                  }
                });
                updatedCount++;
              } catch (updateError) {
                failedCount++;
              }
            }
          }
          
          // 진행률 업데이트
          if (progressCallback) {
            const batchProgress = 30 + ((currentBatch / totalBatches) * 60);
            const processedRows = createdCount + updatedCount + skippedCount;
            progressCallback(batchProgress, processedRows, currentBatch, totalBatches);
          }
        }
      );
    }

    // 4. 처리된 주문들 조회 (진행률: 90-100%)
    const totalProcessed = createdCount + updatedCount;
    if (totalProcessed > 0) {
      const allProcessedCol0Values = [
        ...ordersToCreate.slice(0, createdCount).map(order => order.data.col0),
        ...ordersToUpdate.slice(0, updatedCount).map(order => order.data.col0)
      ];
      
      const processedBatch = await this.prisma.order.findMany({
        where: {
          col0: { in: allProcessedCol0Values }
        },
        select: {
          col0: true,
          orderNumber: true,
          finalorderNumber: true,
          customer: true,
          productName: true,
          partName: true,
          specification: true,
          manager: true,
          quantity: true,
          production: true,
          remaining: true,
          status: true,
          shippingDate: true,
          dDay: true,
          unitPrice: true,
          orderAmount: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      processedOrders.push(...processedBatch.map(order => this.mapToOrderInfoResponseDto(order)));
    }

    const totalSuccess = createdCount + updatedCount + skippedCount;
    const totalFail = failedCount + errors.length;

    // 최종 진행률 업데이트
    if (progressCallback) {
      progressCallback(100, totalSuccess + totalFail);
    }

    return {
      success: totalSuccess,
      fail: totalFail,
      details: {
        created: createdCount,
        updated: updatedCount,
        skipped: skippedCount
      },
      created: processedOrders
    };
  }

  /**
   * 엑셀에서 파싱된 주문 데이터를 대량으로 생성하는 메서드
   * 트랜잭션을 사용하여 데이터 무결성을 보장하고, 중복 검사 및 배치 처리로 성능을 최적화
   */
  async bulkCreateOrders(ordersData: any[]): Promise<{
    success: number;
    fail: number;
    details: {
      created: number;
      updated: number;
      skipped: number;
    };
    created: OrderInfoResponseDto[];
  }> {
    if (!ordersData || ordersData.length === 0) {
      return {
        success: 0,
        fail: 0,
        details: {
          created: 0,
          updated: 0,
          skipped: 0
        },
        created: []
      };
    }

    const errors: Array<{ row: number; error: string; data?: any }> = [];
    const validOrders: Array<{ data: any; originalIndex: number }> = [];

    // 1. 데이터 검증 및 전처리
    for (let i = 0; i < ordersData.length; i++) {
      const orderData = ordersData[i];
      
      try {
        // 필수 필드 검증
        if (!orderData.col0 || typeof orderData.col0 !== 'number') {
          errors.push({
            row: i + 1,
            error: 'col0 필드가 누락되었거나 유효하지 않습니다.',
            data: orderData
          });
          continue;
        }

        // finalorderNumber 검증 (있는 경우)
        if (orderData.finalorderNumber && !this.validateOrderNumberFormat(orderData.finalorderNumber)) {
          errors.push({
            row: i + 1,
            error: '발주번호 형식이 유효하지 않습니다.',
            data: orderData
          });
          continue;
        }

        // 숫자 필드 검증 및 변환
        const numericFields = ['year', 'month', 'day', 'quantity', 'production', 'remaining', 'unitPrice', 'orderAmount'];
        const processedData = { ...orderData };

        for (const field of numericFields) {
          if (processedData[field] !== undefined && processedData[field] !== null) {
            const numValue = Number(processedData[field]);
            if (isNaN(numValue)) {
              processedData[field] = null;
            } else {
              processedData[field] = numValue;
            }
          }
        }

        // 문자열 필드 정리
        const stringFields = [
          'category', 'finalorderNumber', 'orderNumber', 'code', 'registration',
          'col2', 'customer', 'productName', 'partName', 'specification',
          'postProcess', 'status', 'sample', 'shippingDate', 'dDay',
          'manager', 'shipping', 'jig', 'registration2', 'category2',
          'etc', 'category3', 'salesManager'
        ];

        for (const field of stringFields) {
          if (processedData[field] !== undefined && processedData[field] !== null) {
            processedData[field] = String(processedData[field]).trim();
            if (processedData[field] === '') {
              processedData[field] = null;
            }
          }
        }

        validOrders.push({
          data: processedData,
          originalIndex: i
        });

      } catch (error) {
        errors.push({
          row: i + 1,
          error: `데이터 검증 중 오류가 발생했습니다 - ${error.message}`
        });
      }
    }

    if (validOrders.length === 0) {
      return {
        success: 0,
        fail: ordersData.length,
        details: {
          created: 0,
          updated: 0,
          skipped: 0
        },
        created: []
      };
    }

    // 2. 중복 검사 및 업데이트/스킵 분류 (col0 기준)
    const col0Values = validOrders.map(order => order.data.col0);
    const existingOrders = await this.prisma.order.findMany({
      where: {
        col0: { in: col0Values }
      }
    });

    const existingOrdersMap = new Map(existingOrders.map(order => [order.col0, order]));
    const ordersToCreate: Array<{ data: any; originalIndex: number }> = [];
    const ordersToUpdate: Array<{ data: any; originalIndex: number }> = [];
    let skippedCount = 0;

    for (const order of validOrders) {
      const existingOrder = existingOrdersMap.get(order.data.col0);
      
      if (!existingOrder) {
        // 새로운 데이터 - 생성
        ordersToCreate.push(order);
      } else {
        // 기존 데이터와 비교
        const hasChanges = this.hasDataChanges(existingOrder, order.data);
        
        if (hasChanges) {
          // 데이터가 다름 - 업데이트
          ordersToUpdate.push(order);
        } else {
          // 데이터가 같음 - 스킵
          skippedCount++;
        }
      }
    }

    // 3. 배치 처리로 대량 생성 및 업데이트
    const BATCH_SIZE = 100;
    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    const processedOrders: OrderInfoResponseDto[] = [];

    // 3-1. 새로운 데이터 생성
    if (ordersToCreate.length > 0) {
      
      for (let i = 0; i < ordersToCreate.length; i += BATCH_SIZE) {
        const batch = ordersToCreate.slice(i, i + BATCH_SIZE);
        
        try {
          const createData = batch.map(order => ({
            ...order.data,
            createdAt: new Date(),
            updatedAt: new Date()
          }));

          await this.prisma.order.createMany({
            data: createData,
            skipDuplicates: true
          });

          createdCount += batch.length;

        } catch (batchError) {
          
          // 배치 실패 시 개별 처리
          for (const order of batch) {
            try {
              await this.prisma.order.create({
                data: {
                  ...order.data,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              });
              createdCount++;
            } catch (individualError) {
                failedCount++;
            }
          }
        }
      }
    }

    // 3-2. 기존 데이터 업데이트
    if (ordersToUpdate.length > 0) {
      
      for (let i = 0; i < ordersToUpdate.length; i += BATCH_SIZE) {
        const batch = ordersToUpdate.slice(i, i + BATCH_SIZE);
        
        // 업데이트는 개별 처리 (Prisma의 updateMany는 where 조건이 제한적)
        for (const order of batch) {
          try {
            await this.prisma.order.update({
              where: { col0: order.data.col0 },
              data: {
                ...order.data,
                updatedAt: new Date()
              }
            });
            updatedCount++;
          } catch (updateError) {
            failedCount++;
          }
        }
      }
    }

    // 4. 처리된 주문들 조회 (생성 + 업데이트)
    const totalProcessed = createdCount + updatedCount;
    if (totalProcessed > 0) {
      const allProcessedCol0Values = [
        ...ordersToCreate.slice(0, createdCount).map(order => order.data.col0),
        ...ordersToUpdate.slice(0, updatedCount).map(order => order.data.col0)
      ];
      
      const processedBatch = await this.prisma.order.findMany({
        where: {
          col0: { in: allProcessedCol0Values }
        },
        select: {
          col0: true,
          orderNumber: true,
          finalorderNumber: true,
          customer: true,
          productName: true,
          partName: true,
          specification: true,
          manager: true,
          quantity: true,
          production: true,
          remaining: true,
          status: true,
          shippingDate: true,
          dDay: true,
          unitPrice: true,
          orderAmount: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      processedOrders.push(...processedBatch.map(order => this.mapToOrderInfoResponseDto(order)));
    }

    // 성공 = 생성 + 업데이트 + 스킵 (모든 처리된 건수)
    // 실패 = 실제 에러가 발생한 건수 + 검증 실패 건수
    const totalSuccess = createdCount + updatedCount + skippedCount;
    const totalFail = failedCount + errors.length;

    return {
      success: totalSuccess,
      fail: totalFail,
      details: {
        created: createdCount,
        updated: updatedCount,
        skipped: skippedCount
      },
      created: processedOrders
    };
  }

  /**
   * 페이지네이션을 지원하는 주문 목록 조회
   */
  async getOrdersWithPagination(params: {
    page: number;
    pageSize: number;
    search?: string;
    sort?: string;
    dateRange?: {
      from?: Date;
      to?: Date;
      field?: string;
    };
  }): Promise<{
    data: OrderInfoResponseDto[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page, pageSize, search, sort, dateRange } = params;
    const skip = (page - 1) * pageSize;

    // 검색 조건 구성
    const where: any = {};
    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        { finalorderNumber: { contains: searchTerm, mode: 'insensitive' } },
        { orderNumber: { contains: searchTerm, mode: 'insensitive' } },
        { customer: { contains: searchTerm, mode: 'insensitive' } },
        { productName: { contains: searchTerm, mode: 'insensitive' } },
        { partName: { contains: searchTerm, mode: 'insensitive' } },
        { manager: { contains: searchTerm, mode: 'insensitive' } },
        { status: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    // 날짜 범위 필터 추가 (year/month/day 조합 기준)
    if (dateRange && (dateRange.from || dateRange.to)) {
      const dateField = dateRange.field || 'createdAt';
      
      if (dateField === 'createdAt') {
        // createdAt 필드 기준 필터링
        const dateFilter: any = {};
        
        if (dateRange.from) {
          dateFilter.gte = dateRange.from;
        }
        
        if (dateRange.to) {
          // 종료 날짜는 해당 날짜의 끝까지 포함하도록 설정
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          dateFilter.lte = endDate;
        }
        
        where[dateField] = dateFilter;
      } else {
        // year/month/day 조합 기준 필터링 (orderDate)
        const dateConditions: any[] = [];
        
        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          const fromYear = fromDate.getFullYear();
          const fromMonth = fromDate.getMonth() + 1;
          const fromDay = fromDate.getDate();
          
          dateConditions.push({
            OR: [
              { year: { gt: fromYear } },
              {
                AND: [
                  { year: fromYear },
                  { month: { gt: fromMonth } }
                ]
              },
              {
                AND: [
                  { year: fromYear },
                  { month: fromMonth },
                  { day: { gte: fromDay } }
                ]
              }
            ]
          });
        }
        
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          const toYear = toDate.getFullYear();
          const toMonth = toDate.getMonth() + 1;
          const toDay = toDate.getDate();
          
          dateConditions.push({
            OR: [
              { year: { lt: toYear } },
              {
                AND: [
                  { year: toYear },
                  { month: { lt: toMonth } }
                ]
              },
              {
                AND: [
                  { year: toYear },
                  { month: toMonth },
                  { day: { lte: toDay } }
                ]
              }
            ]
          });
        }
        
        if (dateConditions.length > 0) {
          where.AND = (where.AND || []).concat(dateConditions);
        }
      }
    }

    // 정렬 조건 구성
    let orderBy: any = { createdAt: 'desc' }; // 기본 정렬
    if (sort && sort.trim()) {
      const [field, direction] = sort.trim().split('.');
      if (field && direction && ['asc', 'desc'].includes(direction.toLowerCase())) {
        orderBy = { [field]: direction.toLowerCase() };
      }
    }

    // 전체 개수 조회
    const total = await this.prisma.order.count({ where });

    // 데이터 조회
    const orders = await this.prisma.order.findMany({
      where,
      select: {
        col0: true,
        year: true,
        month: true,
        day: true,
        category: true,
        code: true,
        orderNumber: true,
        finalorderNumber: true,
        customer: true,
        productName: true,
        partName: true,
        specification: true,
        manager: true,
        quantity: true,
        production: true,
        remaining: true,
        status: true,
        shippingDate: true,
        dDay: true,
        unitPrice: true,
        orderAmount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy,
      skip,
      take: pageSize
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: orders.map(order => this.mapToOrderInfoResponseDto(order)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages
      }
    };
  }
}