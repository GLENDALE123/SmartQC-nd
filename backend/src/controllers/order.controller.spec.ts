import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from '../services/order.service';
import { ValidationException } from '../exceptions/custom-exceptions';
import { OrderInfoResponseDto } from '../dto/order-info-response.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;

  const mockOrderService = {
    searchByOrderNumbers: jest.fn(),
    checkOrderNumbersExistence: jest.fn(),
    findByOrderNumber: jest.fn(),
  };

  const mockOrderData: OrderInfoResponseDto = {
    col0: 1,
    orderNumber: 'T00000-1',
    finalorderNumber: 'T00000-1-FINAL',
    customer: '테스트 고객',
    productName: '테스트 제품',
    partName: '테스트 부품',
    specification: '테스트 사양',
    manager: '테스트 담당자',
    quantity: 100,
    production: 80,
    remaining: 20,
    status: '진행중',
    shippingDate: '2024-01-15',
    dDay: 'D-5',
    unitPrice: 1000,
    orderAmount: 100000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchOrders', () => {
    it('should throw ValidationException for empty orderNumbers parameter', async () => {
      await expect(controller.searchOrders('')).rejects.toThrow(ValidationException);
      await expect(controller.searchOrders(null as any)).rejects.toThrow(ValidationException);
      await expect(controller.searchOrders(undefined as any)).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException for too many order numbers', async () => {
      const tooManyOrderNumbers = Array.from({ length: 51 }, (_, i) => `T${String(i).padStart(5, '0')}-1`).join(',');
      
      await expect(controller.searchOrders(tooManyOrderNumbers)).rejects.toThrow(ValidationException);
    });

    it('should return successful response with order data', async () => {
      const orderNumbers = 'T00000-1,T00000-2';
      const mockOrders = [mockOrderData];
      const mockExistenceCheck = {
        existing: ['T00000-1'],
        missing: ['T00000-2'],
        invalid: []
      };

      mockOrderService.searchByOrderNumbers.mockResolvedValue(mockOrders);
      mockOrderService.checkOrderNumbersExistence.mockResolvedValue(mockExistenceCheck);

      const result = await controller.searchOrders(orderNumbers);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.orders).toEqual(mockOrders);
      expect(result.data!.missingOrderNumbers).toEqual(['T00000-2']);
      expect(result.data!.invalidOrderNumbers).toEqual([]);
      expect(result.data!.totalRequested).toBe(2);
      expect(result.data!.totalFound).toBe(1);

      expect(mockOrderService.searchByOrderNumbers).toHaveBeenCalledWith(['T00000-1', 'T00000-2']);
      expect(mockOrderService.checkOrderNumbersExistence).toHaveBeenCalledWith(['T00000-1', 'T00000-2']);
    });

    it('should handle invalid order numbers correctly', async () => {
      const orderNumbers = 'T00000-1,invalid<script>,T00000-2';
      const mockOrders = [mockOrderData];
      const mockExistenceCheck = {
        existing: ['T00000-1'],
        missing: ['T00000-2'],
        invalid: ['invalid<script>']
      };

      mockOrderService.searchByOrderNumbers.mockResolvedValue(mockOrders);
      mockOrderService.checkOrderNumbersExistence.mockResolvedValue(mockExistenceCheck);

      const result = await controller.searchOrders(orderNumbers);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.invalidOrderNumbers).toEqual(['invalid<script>']);
      expect(result.message).toContain('1개의 발주번호 형식이 올바르지 않습니다');
    });

    it('should trim whitespace and filter empty strings', async () => {
      const orderNumbers = ' T00000-1 , , T00000-2 ,   ';
      const mockOrders = [mockOrderData];
      const mockExistenceCheck = {
        existing: ['T00000-1'],
        missing: ['T00000-2'],
        invalid: []
      };

      mockOrderService.searchByOrderNumbers.mockResolvedValue(mockOrders);
      mockOrderService.checkOrderNumbersExistence.mockResolvedValue(mockExistenceCheck);

      const result = await controller.searchOrders(orderNumbers);

      expect(mockOrderService.searchByOrderNumbers).toHaveBeenCalledWith(['T00000-1', 'T00000-2']);
      expect(result.data).toBeDefined();
      expect(result.data!.totalRequested).toBe(2);
    });
  });

  describe('getOrderByNumber', () => {
    it('should throw ValidationException for empty orderNumber parameter', async () => {
      await expect(controller.getOrderByNumber('')).rejects.toThrow(ValidationException);
      await expect(controller.getOrderByNumber(null as any)).rejects.toThrow(ValidationException);
      await expect(controller.getOrderByNumber(undefined as any)).rejects.toThrow(ValidationException);
    });

    it('should return order when found', async () => {
      const orderNumber = 'T00000-1';
      mockOrderService.findByOrderNumber.mockResolvedValue(mockOrderData);

      const result = await controller.getOrderByNumber(orderNumber);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrderData);
      expect(result.message).toBe('주문 정보를 조회했습니다.');
      expect(mockOrderService.findByOrderNumber).toHaveBeenCalledWith('T00000-1');
    });

    it('should return null when order not found', async () => {
      const orderNumber = 'T99999-1';
      mockOrderService.findByOrderNumber.mockResolvedValue(null);

      const result = await controller.getOrderByNumber(orderNumber);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.message).toBe('해당 발주번호의 주문 정보를 찾을 수 없습니다.');
    });

    it('should trim whitespace from order number', async () => {
      const orderNumber = '  T00000-1  ';
      mockOrderService.findByOrderNumber.mockResolvedValue(mockOrderData);

      await controller.getOrderByNumber(orderNumber);

      expect(mockOrderService.findByOrderNumber).toHaveBeenCalledWith('T00000-1');
    });
  });
});