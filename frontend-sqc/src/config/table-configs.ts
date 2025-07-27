// 테이블 설정 정의 (Prisma 스키마 기반)

import { TableConfig, ColumnConfig, FilterConfig } from '../types/table-config';
import { TableKey } from '../types/models';

// Order 테이블 컬럼 설정
const orderColumns: ColumnConfig[] = [
  {
    key: 'col0',
    label: 'ID',
    type: 'number',
    sortable: true,
    filterable: false,
    searchable: false,
    visible: true,
    width: 80,
    align: 'center'
  },
  {
    key: 'finalorderNumber',
    label: '발주번호',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 120
  },
  {
    key: 'code',
    label: '코드',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 100
  },
  {
    key: 'customer',
    label: '발주처',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 150
  },
  {
    key: 'productName',
    label: '제품명',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 200
  },
  {
    key: 'partName',
    label: '부속명',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 150
  },
  {
    key: 'quantity',
    label: '발주수량',
    type: 'number',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 100,
    align: 'right'
  },
  {
    key: 'specification',
    label: '사양',
    type: 'text',
    sortable: true,
    filterable: false,
    searchable: true,
    visible: true,
    width: 200
  },
  {
    key: 'status',
    label: '진행상태',
    type: 'badge',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 120,
    enumOptions: [
      { value: '대기', label: '대기', color: 'gray' },
      { value: '진행중', label: '진행중', color: 'blue' },
      { value: '완료', label: '완료', color: 'green' },
      { value: '보류', label: '보류', color: 'yellow' },
      { value: '취소', label: '취소', color: 'red' }
    ]
  },
  {
    key: 'shippingDate',
    label: '출하일',
    type: 'date',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 120,
    format: 'YYYY-MM-DD'
  },
  {
    key: 'manager',
    label: '담당',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 100
  },
  {
    key: 'unitPrice',
    label: '단가',
    type: 'currency',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 120,
    align: 'right',
    format: 'KRW'
  },
  {
    key: 'orderAmount',
    label: '발주금액',
    type: 'currency',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 140,
    align: 'right',
    format: 'KRW'
  },
];

// User 테이블 컬럼 설정
const userColumns: ColumnConfig[] = [
  {
    key: 'id',
    label: 'ID',
    type: 'number',
    sortable: true,
    filterable: false,
    searchable: false,
    visible: true,
    width: 80,
    align: 'center'
  },
  {
    key: 'username',
    label: '사용자명',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 120
  },
  {
    key: 'name',
    label: '이름',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 100
  },
  {
    key: 'role',
    label: '역할',
    type: 'badge',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 100,
    enumOptions: [
      { value: 'admin', label: '관리자', color: 'red' },
      { value: 'inspector', label: '검사원', color: 'blue' },
      { value: 'manager', label: '매니저', color: 'green' },
      { value: 'operator', label: '작업자', color: 'gray' }
    ]
  },
  {
    key: 'rank',
    label: '직급',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 100
  },
  {
    key: 'position',
    label: '직책',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 100
  },
  {
    key: 'inspectionType',
    label: '검사타입',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 120
  },
  {
    key: 'processLine',
    label: '공정라인',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 120
  },
  {
    key: 'isActive',
    label: '활성상태',
    type: 'boolean',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 100,
    align: 'center'
  },
  {
    key: 'lastLoginAt',
    label: '마지막 로그인',
    type: 'datetime',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 160,
    format: 'YYYY-MM-DD HH:mm:ss'
  },
  {
    key: 'createdAt',
    label: '생성일',
    type: 'datetime',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 160,
    format: 'YYYY-MM-DD HH:mm:ss'
  }
];

// DefectType 테이블 컬럼 설정
const defectTypeColumns: ColumnConfig[] = [
  {
    key: 'id',
    label: 'ID',
    type: 'number',
    sortable: true,
    filterable: false,
    searchable: false,
    visible: true,
    width: 80,
    align: 'center'
  },
  {
    key: 'name',
    label: '이름',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 150
  },
  {
    key: 'description',
    label: '설명',
    type: 'text',
    sortable: true,
    filterable: false,
    searchable: true,
    visible: true,
    width: 300
  },
  {
    key: 'color',
    label: '색상',
    type: 'text',
    sortable: false,
    filterable: false,
    searchable: false,
    visible: true,
    width: 100,
    cellRenderer: 'colorCell'
  },
  {
    key: 'createdAt',
    label: '생성일',
    type: 'datetime',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 160,
    format: 'YYYY-MM-DD HH:mm:ss'
  }
];

// IncomingInspection 테이블 컬럼 설정
const incomingInspectionColumns: ColumnConfig[] = [
  {
    key: 'id',
    label: 'ID',
    type: 'number',
    sortable: true,
    filterable: false,
    searchable: false,
    visible: true,
    width: 80,
    align: 'center'
  },
  {
    key: 'orderNumbers',
    label: '발주번호',
    type: 'array',
    sortable: false,
    filterable: true,
    searchable: true,
    visible: true,
    width: 150,
    cellRenderer: 'arrayCell'
  },
  {
    key: 'client',
    label: '발주처',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 150
  },
  {
    key: 'productName',
    label: '제품명',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 200
  },
  {
    key: 'partName',
    label: '부속명',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 150
  },
  {
    key: 'inspectionDate',
    label: '검사일',
    type: 'date',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 120,
    format: 'YYYY-MM-DD'
  },
  {
    key: 'totalQty',
    label: '총 수량',
    type: 'number',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 100,
    align: 'right'
  },
  {
    key: 'defectQty',
    label: '불량 수량',
    type: 'number',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 100,
    align: 'right'
  },
  {
    key: 'status',
    label: '상태',
    type: 'badge',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 100,
    enumOptions: [
      { value: 'draft', label: '임시저장', color: 'gray' },
      { value: 'completed', label: '완료', color: 'green' }
    ]
  },
  {
    key: 'manager',
    label: '담당자',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    visible: true,
    width: 100
  },
  {
    key: 'createdAt',
    label: '생성일',
    type: 'datetime',
    sortable: true,
    filterable: true,
    searchable: false,
    visible: true,
    width: 160,
    format: 'YYYY-MM-DD HH:mm:ss'
  }
];

// 필터 설정
const orderFilters: Record<string, FilterConfig> = {
  status: {
    type: 'select',
    options: [
      { value: '대기', label: '대기' },
      { value: '진행중', label: '진행중' },
      { value: '완료', label: '완료' },
      { value: '보류', label: '보류' },
      { value: '취소', label: '취소' }
    ],
    placeholder: '진행상태 선택'
  },
  category: {
    type: 'select',
    placeholder: '분류 선택'
  },
  manager: {
    type: 'select',
    placeholder: '담당자 선택'
  },
  dateRange: {
    type: 'dateRange',
    placeholder: '날짜 범위 선택'
  }
};

const userFilters: Record<string, FilterConfig> = {
  role: {
    type: 'select',
    options: [
      { value: 'admin', label: '관리자' },
      { value: 'inspector', label: '검사원' },
      { value: 'manager', label: '매니저' },
      { value: 'operator', label: '작업자' }
    ],
    placeholder: '역할 선택'
  },
  isActive: {
    type: 'select',
    options: [
      { value: 'true', label: '활성' },
      { value: 'false', label: '비활성' }
    ],
    placeholder: '활성상태 선택'
  },
  inspectionType: {
    type: 'select',
    options: [
      { value: 'incoming', label: '수입검사' },
      { value: 'process', label: '공정검사' },
      { value: 'shipment', label: '출하검사' },
      { value: 'all', label: '전체' }
    ],
    placeholder: '검사타입 선택'
  }
};

// 테이블 설정 정의
export const tableConfigs: Record<TableKey, TableConfig> = {
  order: {
    key: 'order',
    name: '주문 관리',
    description: '주문 데이터를 관리합니다',
    icon: 'ShoppingCart',
    endpoint: '/api/orders',
    columns: orderColumns,
    searchableFields: ['finalorderNumber', 'customer', 'productName', 'partName', 'code'],
    filterableFields: ['status', 'category', 'manager'],
    dateFields: ['orderDate', 'shippingDate'],
    sortableFields: ['col0', 'finalorderNumber', 'customer', 'productName', 'quantity', 'unitPrice', 'orderAmount', 'orderDate'],
    defaultSort: {
      field: 'col0',
      direction: 'desc'
    },
    pagination: {
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100]
    },
    features: {
      search: true,
      filter: true,
      sort: true,
      export: true,
      bulkActions: true,
      columnVisibility: true,
      refresh: true
    },
    filters: orderFilters,
    bulkActions: [
      {
        key: 'delete',
        label: '삭제',
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationMessage: '선택한 주문을 삭제하시겠습니까?'
      },
      {
        key: 'export',
        label: '내보내기',
        variant: 'outline'
      }
    ],
    rowActions: [
      {
        key: 'view',
        label: '보기',
        variant: 'outline'
      },
      {
        key: 'edit',
        label: '편집',
        variant: 'default'
      },
      {
        key: 'delete',
        label: '삭제',
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationMessage: '이 주문을 삭제하시겠습니까?'
      }
    ]
  },

  user: {
    key: 'user',
    name: '사용자 관리',
    description: '사용자 계정을 관리합니다',
    icon: 'Users',
    endpoint: '/api/users',
    columns: userColumns,
    searchableFields: ['username', 'name', 'rank', 'position'],
    filterableFields: ['role', 'isActive', 'inspectionType'],
    dateFields: ['createdAt', 'lastLoginAt'],
    sortableFields: ['id', 'username', 'name', 'role', 'createdAt'],
    defaultSort: {
      field: 'createdAt',
      direction: 'desc'
    },
    pagination: {
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100]
    },
    features: {
      search: true,
      filter: true,
      sort: true,
      export: true,
      bulkActions: true,
      columnVisibility: true,
      refresh: true
    },
    filters: userFilters,
    bulkActions: [
      {
        key: 'activate',
        label: '활성화',
        variant: 'default'
      },
      {
        key: 'deactivate',
        label: '비활성화',
        variant: 'outline'
      },
      {
        key: 'delete',
        label: '삭제',
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationMessage: '선택한 사용자를 삭제하시겠습니까?'
      }
    ],
    rowActions: [
      {
        key: 'view',
        label: '보기',
        variant: 'outline'
      },
      {
        key: 'edit',
        label: '편집',
        variant: 'default'
      },
      {
        key: 'resetPassword',
        label: '비밀번호 재설정',
        variant: 'outline'
      },
      {
        key: 'delete',
        label: '삭제',
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationMessage: '이 사용자를 삭제하시겠습니까?'
      }
    ]
  },

  defectType: {
    key: 'defectType',
    name: '불량 유형',
    description: '불량 유형을 관리합니다',
    icon: 'AlertTriangle',
    endpoint: '/api/defect-types',
    columns: defectTypeColumns,
    searchableFields: ['name', 'description'],
    filterableFields: [],
    dateFields: ['createdAt'],
    sortableFields: ['id', 'name', 'createdAt'],
    defaultSort: {
      field: 'name',
      direction: 'asc'
    },
    pagination: {
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100]
    },
    features: {
      search: true,
      filter: false,
      sort: true,
      export: true,
      bulkActions: true,
      columnVisibility: true,
      refresh: true
    },
    filters: {},
    bulkActions: [
      {
        key: 'delete',
        label: '삭제',
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationMessage: '선택한 불량 유형을 삭제하시겠습니까?'
      }
    ],
    rowActions: [
      {
        key: 'edit',
        label: '편집',
        variant: 'default'
      },
      {
        key: 'delete',
        label: '삭제',
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationMessage: '이 불량 유형을 삭제하시겠습니까?'
      }
    ]
  },

  incomingInspection: {
    key: 'incomingInspection',
    name: '수입 검사',
    description: '수입 검사 데이터를 관리합니다',
    icon: 'Package',
    endpoint: '/api/incoming-inspections',
    columns: incomingInspectionColumns,
    searchableFields: ['client', 'productName', 'partName', 'manager'],
    filterableFields: ['status'],
    dateFields: ['inspectionDate', 'createdAt'],
    sortableFields: ['id', 'inspectionDate', 'totalQty', 'defectQty', 'createdAt'],
    defaultSort: {
      field: 'inspectionDate',
      direction: 'desc'
    },
    pagination: {
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100]
    },
    features: {
      search: true,
      filter: true,
      sort: true,
      export: true,
      bulkActions: true,
      columnVisibility: true,
      refresh: true
    },
    filters: {
      status: {
        type: 'select',
        options: [
          { value: 'draft', label: '임시저장' },
          { value: 'completed', label: '완료' }
        ],
        placeholder: '상태 선택'
      }
    },
    bulkActions: [
      {
        key: 'complete',
        label: '완료 처리',
        variant: 'default'
      },
      {
        key: 'delete',
        label: '삭제',
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationMessage: '선택한 검사를 삭제하시겠습니까?'
      }
    ],
    rowActions: [
      {
        key: 'view',
        label: '보기',
        variant: 'outline'
      },
      {
        key: 'edit',
        label: '편집',
        variant: 'default'
      },
      {
        key: 'complete',
        label: '완료 처리',
        variant: 'default',
        condition: (row) => row.status === 'draft'
      },
      {
        key: 'delete',
        label: '삭제',
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationMessage: '이 검사를 삭제하시겠습니까?'
      }
    ]
  },

  // ProcessInspection과 ShipmentInspection은 유사한 구조로 설정
  processInspection: {
    key: 'processInspection',
    name: '공정 검사',
    description: '공정 검사 데이터를 관리합니다',
    icon: 'Settings',
    endpoint: '/api/process-inspections',
    columns: incomingInspectionColumns, // 임시로 동일한 컬럼 사용
    searchableFields: ['client', 'productName', 'partName', 'manager'],
    filterableFields: ['status'],
    dateFields: ['inspectionDate', 'createdAt'],
    sortableFields: ['id', 'inspectionDate', 'totalQty', 'defectQty', 'createdAt'],
    defaultSort: {
      field: 'inspectionDate',
      direction: 'desc'
    },
    pagination: {
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100]
    },
    features: {
      search: true,
      filter: true,
      sort: true,
      export: true,
      bulkActions: true,
      columnVisibility: true,
      refresh: true
    },
    filters: {
      status: {
        type: 'select',
        options: [
          { value: 'draft', label: '임시저장' },
          { value: 'completed', label: '완료' }
        ],
        placeholder: '상태 선택'
      }
    },
    bulkActions: [],
    rowActions: []
  },

  shipmentInspection: {
    key: 'shipmentInspection',
    name: '출하 검사',
    description: '출하 검사 데이터를 관리합니다',
    icon: 'Truck',
    endpoint: '/api/shipment-inspections',
    columns: incomingInspectionColumns, // 임시로 동일한 컬럼 사용
    searchableFields: ['client', 'productName', 'partName', 'manager'],
    filterableFields: ['status'],
    dateFields: ['inspectionDate', 'createdAt'],
    sortableFields: ['id', 'inspectionDate', 'totalQty', 'defectQty', 'createdAt'],
    defaultSort: {
      field: 'inspectionDate',
      direction: 'desc'
    },
    pagination: {
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100]
    },
    features: {
      search: true,
      filter: true,
      sort: true,
      export: true,
      bulkActions: true,
      columnVisibility: true,
      refresh: true
    },
    filters: {
      status: {
        type: 'select',
        options: [
          { value: 'draft', label: '임시저장' },
          { value: 'completed', label: '완료' }
        ],
        placeholder: '상태 선택'
      }
    },
    bulkActions: [],
    rowActions: []
  },

  uploadLog: {
    key: 'uploadLog',
    name: '업로드 로그',
    description: '파일 업로드 기록을 관리합니다',
    icon: 'Upload',
    endpoint: '/api/upload-logs',
    columns: [
      {
        key: 'id',
        label: 'ID',
        type: 'number',
        sortable: true,
        filterable: false,
        searchable: false,
        visible: true,
        width: 80,
        align: 'center'
      },
      {
        key: 'fileName',
        label: '파일명',
        type: 'text',
        sortable: true,
        filterable: true,
        searchable: true,
        visible: true,
        width: 200
      },
      {
        key: 'successCount',
        label: '성공',
        type: 'number',
        sortable: true,
        filterable: false,
        searchable: false,
        visible: true,
        width: 100,
        align: 'right'
      },
      {
        key: 'failedCount',
        label: '실패',
        type: 'number',
        sortable: true,
        filterable: false,
        searchable: false,
        visible: true,
        width: 100,
        align: 'right'
      },
      {
        key: 'createdAt',
        label: '업로드일',
        type: 'datetime',
        sortable: true,
        filterable: true,
        searchable: false,
        visible: true,
        width: 160,
        format: 'YYYY-MM-DD HH:mm:ss'
      }
    ],
    searchableFields: ['fileName'],
    filterableFields: [],
    dateFields: ['createdAt'],
    sortableFields: ['id', 'fileName', 'successCount', 'failedCount', 'createdAt'],
    defaultSort: {
      field: 'createdAt',
      direction: 'desc'
    },
    pagination: {
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100]
    },
    features: {
      search: true,
      filter: false,
      sort: true,
      export: true,
      bulkActions: false,
      columnVisibility: true,
      refresh: true
    },
    filters: {},
    bulkActions: [],
    rowActions: [
      {
        key: 'view',
        label: '상세보기',
        variant: 'outline'
      },
      {
        key: 'download',
        label: '결과 다운로드',
        variant: 'default'
      }
    ]
  }
};

// 기본 다중 테이블 설정
export const defaultMultiTableConfig = {
  tables: tableConfigs,
  defaultTable: 'order' as TableKey,
  layout: {
    sidebarWidth: 280,
    showTableSelector: true,
    showViewManager: true
  },
  features: {
    tableSwitch: true,
    viewManagement: true,
    globalSearch: false,
    crossTableActions: false
  }
};