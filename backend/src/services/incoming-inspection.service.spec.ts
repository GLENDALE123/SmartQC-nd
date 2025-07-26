import { Test, TestingModule } from '@nestjs/testing';
import { IncomingInspectionService } from './incoming-inspection.service';
import { PrismaService } from '../prisma.service';
import { SharedFolderService } from './shared-folder.service';
import { CreateIncomingInspectionDto } from '../dto/create-incoming-inspection.dto';

describe('IncomingInspectionService', () => {
  let service: IncomingInspectionService;
  let prismaService: PrismaService;
  let sharedFolderService: SharedFolderService;

  const mockPrismaService = {
    incomingInspection: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    incomingInspectionDefect: {
      deleteMany: jest.fn(),
    },
    attachment: {
      deleteMany: jest.fn(),
    },
  };

  const mockSharedFolderService = {
    uploadImageWithInspectionId: jest.fn(),
    deleteInspectionFolder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncomingInspectionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SharedFolderService,
          useValue: mockSharedFolderService,
        },
      ],
    }).compile();

    service = module.get<IncomingInspectionService>(IncomingInspectionService);
    prismaService = module.get<PrismaService>(PrismaService);
    sharedFolderService = module.get<SharedFolderService>(SharedFolderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create incoming inspection with orderNumbers-based structure', async () => {
      const dto: CreateIncomingInspectionDto = {
        orderNumbers: ['T00000-1', 'T00000-2'],
        client: 'Test Client',
        productName: 'Test Product',
        partName: 'Test Part',
        specification: 'Test Spec',
        manager: 'Test Manager',
        inspectionDate: '2024-01-15',
        totalQty: 100,
        defectQty: 5,
        notes: 'Test notes',
        defects: [
          { defectTypeId: 1, count: 3 },
          { customType: 'Custom defect', count: 2 }
        ],
      };

      const mockInspection = {
        id: 1,
        ...dto,
        inspectionDate: new Date(dto.inspectionDate),
        defects: dto.defects,
        attachments: [],
      };

      mockPrismaService.incomingInspection.create.mockResolvedValue(mockInspection);

      const result = await service.create(dto);

      expect(mockPrismaService.incomingInspection.create).toHaveBeenCalledWith({
        data: {
          orderNumbers: dto.orderNumbers,
          client: dto.client,
          productName: dto.productName,
          partName: dto.partName,
          specification: dto.specification,
          manager: dto.manager,
          inspectionDate: new Date(dto.inspectionDate),
          totalQty: dto.totalQty,
          defectQty: dto.defectQty,
          notes: dto.notes,
          defects: {
            create: dto.defects.map(d => ({
              defectTypeId: d.defectTypeId,
              customType: d.customType,
              count: d.count,
              details: d.details,
            })),
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

      expect(result).toEqual(mockInspection);
    });

    it('should handle file uploads correctly', async () => {
      const dto: CreateIncomingInspectionDto = {
        orderNumbers: ['T00000-1'],
        client: 'Test Client',
        productName: 'Test Product',
        partName: 'Test Part',
        specification: 'Test Spec',
        manager: 'Test Manager',
        inspectionDate: '2024-01-15',
        totalQty: 100,
        defectQty: 0,
        defects: [],
        attachments: [
          { file: { originalname: 'test.jpg' } as Express.Multer.File }
        ],
      };

      const mockInspection = {
        id: 1,
        ...dto,
        inspectionDate: new Date(dto.inspectionDate),
        defects: [],
        attachments: [],
      };

      mockPrismaService.incomingInspection.create.mockResolvedValue(mockInspection);
      mockSharedFolderService.uploadImageWithInspectionId.mockResolvedValue(undefined);

      await service.create(dto);

      expect(mockSharedFolderService.uploadImageWithInspectionId).toHaveBeenCalledWith(
        dto.attachments![0].file,
        1,
        'incoming'
      );
    });
  });

  describe('getReferences', () => {
    it('should find references by orderNumbers', async () => {
      const params = {
        orderNumbers: ['T00000-1', 'T00000-2'],
        productName: 'Test Product',
        partName: 'Test Part',
        client: 'Test Client',
      };

      const mockReferences = [
        {
          id: 1,
          orderNumbers: ['T00000-1'],
          productName: 'Test Product',
          defects: [],
        },
      ];

      mockPrismaService.incomingInspection.findMany.mockResolvedValue(mockReferences);

      const result = await service.getReferences(params);

      expect(mockPrismaService.incomingInspection.findMany).toHaveBeenCalledWith({
        where: {
          orderNumbers: {
            hasSome: params.orderNumbers,
          },
          productName: {
            contains: params.productName,
            mode: 'insensitive',
          },
          partName: {
            contains: params.partName,
            mode: 'insensitive',
          },
          client: {
            contains: params.client,
            mode: 'insensitive',
          },
        },
        include: {
          defects: {
            include: {
              defectType: true,
            },
          },
        },
        orderBy: { inspectionDate: 'desc' },
        take: 10,
      });

      expect(result).toEqual(mockReferences);
    });

    it('should handle empty orderNumbers in getReferences', async () => {
      const params = {
        productName: 'Test Product',
      };

      const mockReferences: any[] = [];
      mockPrismaService.incomingInspection.findMany.mockResolvedValue(mockReferences);

      const result = await service.getReferences(params);

      expect(mockPrismaService.incomingInspection.findMany).toHaveBeenCalledWith({
        where: {
          productName: {
            contains: params.productName,
            mode: 'insensitive',
          },
        },
        include: {
          defects: {
            include: {
              defectType: true,
            },
          },
        },
        orderBy: { inspectionDate: 'desc' },
        take: 10,
      });

      expect(result).toEqual(mockReferences);
    });

    it('should handle single orderNumber parameter', async () => {
      const params = {
        orderNumber: 'T00000-1',
        productName: 'Test Product',
      };

      const mockReferences = [
        {
          id: 1,
          orderNumbers: ['T00000-1'],
          productName: 'Test Product',
          defects: [],
        },
      ];

      mockPrismaService.incomingInspection.findMany.mockResolvedValue(mockReferences);

      const result = await service.getReferences(params);

      expect(mockPrismaService.incomingInspection.findMany).toHaveBeenCalledWith({
        where: {
          orderNumbers: {
            hasSome: ['T00000-1'],
          },
          productName: {
            contains: params.productName,
            mode: 'insensitive',
          },
        },
        include: {
          defects: {
            include: {
              defectType: true,
            },
          },
        },
        orderBy: { inspectionDate: 'desc' },
        take: 10,
      });

      expect(result).toEqual(mockReferences);
    });
  });
});