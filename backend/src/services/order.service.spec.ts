import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma.service';
import { OrderInfoResponseDto } from '../dto/order-info-response.dto';

describe('OrderService', () => {
    let service: OrderService;
    let prismaService: PrismaService;

    const mockPrismaService = {
        order: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
        },
    };

    const mockOrderData = {
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
            providers: [
                OrderService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<OrderService>(OrderService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('searchByOrderNumbers', () => {
        it('should return empty array for empty input', async () => {
            const result = await service.searchByOrderNumbers([]);
            expect(result).toEqual([]);
        });

        it('should return empty array for null input', async () => {
            const result = await service.searchByOrderNumbers(null as any);
            expect(result).toEqual([]);
        });

        it('should filter out invalid order numbers and return valid results', async () => {
            const validOrderNumbers = ['T00000-1', 'T00000-2'];
            const invalidOrderNumbers = ['', '   ', 'invalid<script>'];
            const inputOrderNumbers = [...validOrderNumbers, ...invalidOrderNumbers];

            mockPrismaService.order.findMany.mockResolvedValue([mockOrderData]);

            const result = await service.searchByOrderNumbers(inputOrderNumbers);

            expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { orderNumber: { in: validOrderNumbers } },
                        { finalorderNumber: { in: validOrderNumbers } }
                    ]
                },
                select: expect.any(Object),
                orderBy: [
                    { createdAt: 'desc' },
                    { col0: 'desc' }
                ]
            });

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(expect.objectContaining({
                col0: mockOrderData.col0,
                orderNumber: mockOrderData.orderNumber,
                customer: mockOrderData.customer,
            }));
        });

        it('should handle batch processing for large order number arrays', async () => {
            // Create 150 order numbers to test batch processing (BATCH_SIZE = 100)
            const largeOrderNumberArray = Array.from({ length: 150 }, (_, i) => `T${String(i).padStart(5, '0')}-1`);

            mockPrismaService.order.findMany.mockResolvedValue([mockOrderData]);

            const result = await service.searchByOrderNumbers(largeOrderNumberArray);

            // Should be called twice due to batch processing
            expect(mockPrismaService.order.findMany).toHaveBeenCalledTimes(2);
            expect(result).toBeDefined();
        });

        it('should remove duplicate order numbers', async () => {
            const orderNumbersWithDuplicates = ['T00000-1', 'T00000-1', 'T00000-2', 'T00000-2'];
            const expectedUniqueNumbers = ['T00000-1', 'T00000-2'];

            mockPrismaService.order.findMany.mockResolvedValue([mockOrderData]);

            await service.searchByOrderNumbers(orderNumbersWithDuplicates);

            expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { orderNumber: { in: expectedUniqueNumbers } },
                        { finalorderNumber: { in: expectedUniqueNumbers } }
                    ]
                },
                select: expect.any(Object),
                orderBy: expect.any(Array)
            });
        });
    });

    describe('findByOrderNumber', () => {
        it('should return null for invalid order number format', async () => {
            const invalidOrderNumbers = ['', '   ', 'invalid<script>', null, undefined];

            for (const invalidOrderNumber of invalidOrderNumbers) {
                const result = await service.findByOrderNumber(invalidOrderNumber as any);
                expect(result).toBeNull();
            }

            expect(mockPrismaService.order.findFirst).not.toHaveBeenCalled();
        });

        it('should return null for order number that is too long', async () => {
            const tooLongOrderNumber = 'T' + '0'.repeat(50) + '-1'; // 53 characters
            const result = await service.findByOrderNumber(tooLongOrderNumber);
            expect(result).toBeNull();
        });

        it('should return order for valid order number', async () => {
            const validOrderNumber = 'T00000-1';
            mockPrismaService.order.findFirst.mockResolvedValue(mockOrderData);

            const result = await service.findByOrderNumber(validOrderNumber);

            expect(mockPrismaService.order.findFirst).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { orderNumber: validOrderNumber },
                        { finalorderNumber: validOrderNumber }
                    ]
                },
                select: expect.any(Object)
            });

            expect(result).toEqual(expect.objectContaining({
                col0: mockOrderData.col0,
                orderNumber: mockOrderData.orderNumber,
                customer: mockOrderData.customer,
            }));
        });

        it('should return null when order is not found', async () => {
            const validOrderNumber = 'T99999-1';
            mockPrismaService.order.findFirst.mockResolvedValue(null);

            const result = await service.findByOrderNumber(validOrderNumber);

            expect(result).toBeNull();
        });

        it('should trim whitespace from order number', async () => {
            const orderNumberWithWhitespace = '  T00000-1  ';
            const trimmedOrderNumber = 'T00000-1';
            mockPrismaService.order.findFirst.mockResolvedValue(mockOrderData);

            await service.findByOrderNumber(orderNumberWithWhitespace);

            expect(mockPrismaService.order.findFirst).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { orderNumber: trimmedOrderNumber },
                        { finalorderNumber: trimmedOrderNumber }
                    ]
                },
                select: expect.any(Object)
            });
        });
    });

    describe('findMissingOrderNumbers', () => {
        it('should return empty array for empty input', async () => {
            const result = await service.findMissingOrderNumbers([]);
            expect(result).toEqual([]);
        });

        it('should return original invalid order numbers when all are invalid', async () => {
            const invalidOrderNumbers = ['invalid<script>', ''];
            const result = await service.findMissingOrderNumbers(invalidOrderNumbers);
            expect(result).toEqual(['invalid<script>']);
        });

        it('should return missing order numbers', async () => {
            const orderNumbers = ['T00000-1', 'T00000-2', 'T00000-3'];
            const existingOrders = [
                { orderNumber: 'T00000-1', finalorderNumber: null },
                { orderNumber: null, finalorderNumber: 'T00000-2' }
            ];

            mockPrismaService.order.findMany.mockResolvedValue(existingOrders);

            const result = await service.findMissingOrderNumbers(orderNumbers);

            expect(result).toEqual(['T00000-3']);
            expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { orderNumber: { in: orderNumbers } },
                        { finalorderNumber: { in: orderNumbers } }
                    ]
                },
                select: {
                    orderNumber: true,
                    finalorderNumber: true,
                }
            });
        });

        it('should handle batch processing for large arrays', async () => {
            const largeOrderNumberArray = Array.from({ length: 150 }, (_, i) => `T${String(i).padStart(5, '0')}-1`);

            mockPrismaService.order.findMany.mockResolvedValue([]);

            const result = await service.findMissingOrderNumbers(largeOrderNumberArray);

            // Should be called twice due to batch processing
            expect(mockPrismaService.order.findMany).toHaveBeenCalledTimes(2);
            expect(result).toBeDefined();
        });
    });

    describe('checkOrderNumbersExistence', () => {
        it('should return empty arrays for empty input', async () => {
            const result = await service.checkOrderNumbersExistence([]);
            expect(result).toEqual({
                existing: [],
                missing: [],
                invalid: []
            });
        });

        it('should categorize order numbers correctly', async () => {
            const orderNumbers = ['T00000-1', 'T00000-2', 'invalid<script>', '', '  T00000-3  '];
            const existingOrders = [
                { orderNumber: 'T00000-1', finalorderNumber: null },
            ];

            mockPrismaService.order.findMany.mockResolvedValue(existingOrders);

            const result = await service.checkOrderNumbersExistence(orderNumbers);

            expect(result.existing).toEqual(['T00000-1']);
            expect(result.missing).toEqual(['T00000-2', 'T00000-3']);
            expect(result.invalid).toEqual(['invalid<script>']);
        });

        it('should handle both orderNumber and finalorderNumber fields', async () => {
            const orderNumbers = ['T00000-1', 'T00000-2'];
            const existingOrders = [
                { orderNumber: 'T00000-1', finalorderNumber: null },
                { orderNumber: null, finalorderNumber: 'T00000-2' }
            ];

            mockPrismaService.order.findMany.mockResolvedValue(existingOrders);

            const result = await service.checkOrderNumbersExistence(orderNumbers);

            expect(result.existing).toEqual(['T00000-1', 'T00000-2']);
            expect(result.missing).toEqual([]);
            expect(result.invalid).toEqual([]);
        });
    });

    describe('order number format validation', () => {
        it('should validate correct order number formats', async () => {
            const validOrderNumbers = [
                'T00000-1',
                'ABC123-4',
                'T12345-999',
                'A1B2C3-1',
                'SIMPLE123', // without hyphen
                'T123'       // without hyphen
            ];

            for (const orderNumber of validOrderNumbers) {
                mockPrismaService.order.findFirst.mockResolvedValue(mockOrderData);
                const result = await service.findByOrderNumber(orderNumber);
                expect(result).not.toBeNull();
            }
        });

        it('should reject invalid order number formats', async () => {
            const invalidOrderNumbers = [
                '123-ABC',     // starts with number
                'T00000-',     // ends with hyphen
                '-T00000',     // starts with hyphen
                'T<script>-1', // contains script tag
                'T"00000-1',   // contains quote
                'T00000;DROP', // contains semicolon
                'T' + '0'.repeat(50) + '-1', // too long
                '',            // empty
                '   ',         // whitespace only
            ];

            for (const orderNumber of invalidOrderNumbers) {
                const result = await service.findByOrderNumber(orderNumber);
                expect(result).toBeNull();
            }

            expect(mockPrismaService.order.findFirst).not.toHaveBeenCalled();
        });
    });
});