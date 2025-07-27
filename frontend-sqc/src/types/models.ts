// Prisma 스키마 기반 모든 테이블 TypeScript 인터페이스 정의

// Enums from Prisma schema
export enum UserRole {
  ADMIN = 'admin',
  INSPECTOR = 'inspector',
  MANAGER = 'manager',
  OPERATOR = 'operator'
}

export enum InspectionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PASSED = 'passed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum InspectionDraftStatus {
  DRAFT = 'draft',
  COMPLETED = 'completed'
}

export enum InspectionType {
  VISUAL = 'visual',
  MEASUREMENT = 'measurement',
  FUNCTIONAL = 'functional',
  SAFETY = 'safety'
}

// User 모델 인터페이스
export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  inspectionType?: string; // 'incoming', 'process', 'shipment', 'all'
  processLine?: string;
  authType?: string; // 'local', 'oauth'
  rank?: string; // 직급
  position?: string; // 직책
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// DefectType 모델 인터페이스
export interface DefectType {
  id: number;
  name: string;
  description?: string;
  color?: string; // 색상 필드
  createdAt: Date;
  updatedAt: Date;
  // Relations
  incomingInspectionDefects?: IncomingInspectionDefect[];
  processInspectionDefects?: ProcessInspectionDefect[];
  shipmentInspectionDefects?: ShipmentInspectionDefect[];
}

// UploadLog 모델 인터페이스
export interface UploadLog {
  id: number;
  userId?: number;
  fileName: string;
  successCount: number;
  failedCount: number;
  results: any; // JSON 타입
  createdAt: Date;
}

// Order 모델 인터페이스 (Prisma 스키마 기반)
export interface Order {
  col0: number; // ID (Primary Key)
  year?: number; // 년
  month?: number; // 월
  day?: number; // 일
  category?: string; // 분류
  finalorderNumber?: string; // 발주번호
  orderNumber?: string; // 열1
  code?: string; // 코드
  registration?: string; // 등록번호
  col2?: string; // 열2
  customer?: string; // 발주처
  productName?: string; // 제품명
  partName?: string; // 부속명
  quantity?: number; // 발주수량
  specification?: string; // 사양
  postProcess?: string; // 후공정
  production?: number; // 생산
  remaining?: number; // 잔여
  status?: string; // 진행
  sample?: string; // 견본
  shippingDate?: string; // 출하일
  dDay?: string; // D-DAY
  manager?: string; // 담당
  shipping?: string; // 출하
  jig?: string; // 지그
  registration2?: string; // 등록
  category2?: string; // 구분
  unitPrice?: number; // 단가
  orderAmount?: number; // 발주금액
  etc?: string; // 기타
  category3?: string; // 구분2
  salesManager?: string; // 매출담당
  createdAt: Date;
  updatedAt: Date;
}

// IncomingInspection 모델 인터페이스
export interface IncomingInspection {
  id: number;
  orderNumbers: string[]; // 발주번호 배열
  client?: string; // 발주처
  productName?: string; // 제품명
  partName?: string; // 부속명
  specification?: string; // 사양
  manager?: string; // 담당자
  inspectionDate: Date;
  totalQty: number;
  defectQty: number;
  notes?: string;
  status: InspectionDraftStatus;
  defects: IncomingInspectionDefect[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

// IncomingInspectionDefect 모델 인터페이스
export interface IncomingInspectionDefect {
  id: number;
  inspection: IncomingInspection;
  inspectionId: number;
  defectType?: DefectType;
  defectTypeId?: number;
  customType?: string;
  count: number;
  details?: any; // JSON 타입
}

// ProcessInspection 모델 인터페이스
export interface ProcessInspection {
  id: number;
  orderNumbers: string[]; // 발주번호 배열
  client?: string; // 발주처
  productName?: string; // 제품명
  partName?: string; // 부속명
  specification?: string; // 사양
  manager?: string; // 담당자
  inspectionDate: Date;
  totalQty: number;
  defectQty: number;
  notes?: string;
  status: InspectionDraftStatus;
  paintPrimer?: string;
  paintTopcoat?: string;
  line?: string;
  subLine?: string;
  peelingTest?: string;
  colorDiff?: string;
  extraWork?: string;
  lineSpeed?: string;
  spindleRatio?: string;
  uvCond?: string;
  irCond?: string;
  jig?: string;
  injectionPack?: string;
  afterPack?: string;
  rounds: ProcessInspectionRound[];
  defects: ProcessInspectionDefect[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

// ProcessInspectionRound 모델 인터페이스
export interface ProcessInspectionRound {
  id: number;
  inspection: ProcessInspection;
  inspectionId: number;
  label: string;
  qty: number;
}

// ProcessInspectionDefect 모델 인터페이스
export interface ProcessInspectionDefect {
  id: number;
  inspection: ProcessInspection;
  inspectionId: number;
  defectType?: DefectType;
  defectTypeId?: number;
  customType?: string;
  count: number;
  details?: any; // JSON 타입
}

// ShipmentInspection 모델 인터페이스
export interface ShipmentInspection {
  id: number;
  orderNumbers: string[]; // 발주번호 배열
  client?: string; // 발주처
  productName?: string; // 제품명
  partName?: string; // 부속명
  specification?: string; // 사양
  manager?: string; // 담당자
  inspectionDate: Date;
  totalQty: number;
  defectQty: number;
  notes?: string;
  status: InspectionDraftStatus;
  finalPeeling?: string;
  externalCheck?: boolean;
  rounds: ShipmentInspectionRound[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

// ShipmentInspectionRound 모델 인터페이스
export interface ShipmentInspectionRound {
  id: number;
  inspection: ShipmentInspection;
  inspectionId: number;
  date: Date;
  qty: number;
  defectQty: number;
  workers: ShipmentInspectionWorker[];
}

// ShipmentInspectionWorker 모델 인터페이스
export interface ShipmentInspectionWorker {
  id: number;
  round: ShipmentInspectionRound;
  roundId: number;
  name: string;
  defects: ShipmentInspectionDefect[];
}

// ShipmentInspectionDefect 모델 인터페이스
export interface ShipmentInspectionDefect {
  id: number;
  worker: ShipmentInspectionWorker;
  workerId: number;
  defectType?: DefectType;
  defectTypeId?: number;
  customType?: string;
  count: number;
  details?: any; // JSON 타입
}

// Attachment 모델 인터페이스
export interface Attachment {
  id: number;
  url: string;
  fileName: string;
  createdAt: Date;
  incomingInspectionId?: number;
  processInspectionId?: number;
  shipmentInspectionId?: number;
  incomingInspection?: IncomingInspection;
  processInspection?: ProcessInspection;
  shipmentInspection?: ShipmentInspection;
}

// 유니온 타입 정의
export type AnyInspection = IncomingInspection | ProcessInspection | ShipmentInspection;
export type AnyInspectionDefect = IncomingInspectionDefect | ProcessInspectionDefect | ShipmentInspectionDefect;

// 테이블 키 타입
export type TableKey = 'order' | 'user' | 'defectType' | 'incomingInspection' | 'processInspection' | 'shipmentInspection' | 'uploadLog';

// 테이블 데이터 타입 매핑
export type TableDataMap = {
  order: Order;
  user: User;
  defectType: DefectType;
  incomingInspection: IncomingInspection;
  processInspection: ProcessInspection;
  shipmentInspection: ShipmentInspection;
  uploadLog: UploadLog;
};