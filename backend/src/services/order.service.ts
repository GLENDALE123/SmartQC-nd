import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrderInfoResponseDto } from '../dto/order-info-response.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

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
}