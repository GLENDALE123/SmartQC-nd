// 사용자 관련 타입
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  phoneNumber?: string;
  department?: string;
  authType?: 'local' | 'oauth';
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  INSPECTOR = 'inspector',
  MANAGER = 'manager',
  OPERATOR = 'operator'
}

// 품질 검사 관련 타입
export interface Inspection {
  id: number;
  productId: string;
  productName: string;
  batchNumber: string;
  inspectorId: number;
  type: InspectionType;
  status: InspectionStatus;
  description?: string;
  results?: any;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  inspector: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  };
}

export enum InspectionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PASSED = 'passed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum InspectionType {
  INCOMING = 'incoming',
  PROCESS = 'process',
  SHIPMENT = 'shipment',
}

// DTO 타입들
export interface CreateInspectionDto {
  productId: string;
  productName: string;
  batchNumber: string;
  type: InspectionType;
  inspectionDate: string;
  inspectedQuantity: number;
  defectQty: number;
  defectTypeIds: number[];
  notes?: string;
  // 기타 필요한 필드 추가 가능
}

export interface UpdateInspectionDto {
  status?: InspectionStatus;
  results?: any;
  notes?: string;
  completedAt?: string;
}

// 제품 관련 타입
export interface Product {
  id: number;
  productId: string;
  name: string;
  description?: string;
  category: string;
  manufacturer?: string;
  model?: string;
  specifications?: any;
  isActive: boolean;
  lastInspectionDate?: string;
  createdAt: string;
  updatedAt: string;
}

// 인증 관련 타입
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  department?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 