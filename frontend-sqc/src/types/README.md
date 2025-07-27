# 다중 테이블 DataTable 타입 시스템

이 디렉토리는 다중 테이블 지원을 위한 포괄적인 TypeScript 타입 정의를 포함합니다.

## 파일 구조

### `models.ts`
- Prisma 스키마 기반 모든 테이블 인터페이스 정의
- 지원 테이블: Order, User, DefectType, IncomingInspection, ProcessInspection, ShipmentInspection, UploadLog
- Enum 타입 정의 (UserRole, InspectionStatus, InspectionDraftStatus, InspectionType)
- 유니온 타입 및 테이블 데이터 매핑 타입

### `table-config.ts`
- 테이블 설정 및 메타데이터 타입 정의
- 컬럼 설정, 필터 설정, 테이블 설정 인터페이스
- 다중 테이블 상태 관리 타입
- 테이블 뷰 설정 및 컨텍스트 타입

### `api.ts`
- API 응답 타입 정의
- 페이지네이션, 에러 처리, 벌크 액션 타입
- 데이터 내보내기/가져오기 타입
- 실시간 업데이트 및 WebSocket 타입
- API 클라이언트 설정 타입

### `multi-table.ts`
- 다중 테이블 상태 관리 타입
- 전역 상태, UI 상태, 실시간 연결 상태
- 다중 테이블 컨텍스트 및 액션 타입
- 키보드 단축키, 성능 메트릭, 접근성 설정

### `type-guards.ts`
- 타입 가드 및 유효성 검사 함수
- 런타임 타입 검증
- 모델별 유효성 검사 함수
- 배치 유효성 검사 지원

### `auth.ts` (기존)
- 인증 관련 타입 정의

### `data-table.ts` (기존)
- 기존 DataTable 컴포넌트 타입

## 사용 예시

### 1. 테이블 설정 가져오기
```typescript
import { getTableConfig, TableKey } from '@/types';

const orderConfig = getTableConfig('order');
console.log(orderConfig.name); // "주문 관리"
```

### 2. 타입 가드 사용
```typescript
import { isTableData, isValidTableKey } from '@/types';

if (isValidTableKey(tableKey) && isTableData(data, tableKey)) {
  // 타입 안전한 데이터 처리
}
```

### 3. 유효성 검사
```typescript
import { validateUser, validateOrder } from '@/types';

const userValidation = validateUser(userData);
if (!userValidation.valid) {
  console.error(userValidation.errors);
}
```

### 4. 다중 테이블 상태 관리
```typescript
import { MultiTableState, MultiTableAction } from '@/types';

const initialState: MultiTableState = {
  activeTable: 'order',
  tables: { /* ... */ },
  // ...
};
```

## 주요 특징

### 1. 타입 안전성
- 모든 테이블 데이터에 대한 완전한 타입 정의
- 컴파일 타임 타입 검증
- 런타임 타입 가드 지원

### 2. 확장성
- 새로운 테이블 추가 용이
- 설정 기반 컬럼 정의
- 플러그인 방식의 기능 확장

### 3. 재사용성
- 공통 인터페이스 및 유틸리티 타입
- 테이블별 특화 설정 지원
- 컴포넌트 간 타입 공유

### 4. 유지보수성
- 중앙집중식 타입 관리
- 일관된 네이밍 컨벤션
- 상세한 JSDoc 주석

## 테이블별 주요 필드

### Order (주문)
- `col0`: ID (Primary Key)
- `finalorderNumber`: 발주번호
- `customer`: 발주처
- `productName`: 제품명
- `quantity`: 발주수량
- `status`: 진행상태
- `unitPrice`: 단가
- `orderAmount`: 발주금액

### User (사용자)
- `id`: ID
- `username`: 사용자명
- `name`: 이름
- `role`: 역할 (admin, inspector, manager, operator)
- `rank`: 직급
- `position`: 직책
- `inspectionType`: 검사타입

### DefectType (불량 유형)
- `id`: ID
- `name`: 이름
- `description`: 설명
- `color`: 색상

### IncomingInspection (수입 검사)
- `id`: ID
- `orderNumbers`: 발주번호 배열
- `client`: 발주처
- `inspectionDate`: 검사일
- `totalQty`: 총 수량
- `defectQty`: 불량 수량
- `status`: 상태 (draft, completed)

## 설정 파일

### `table-configs.ts`
실제 테이블 설정이 정의된 파일입니다:
- 각 테이블의 컬럼 설정
- 검색/필터/정렬 가능 필드
- 기본 정렬 및 페이지네이션 설정
- 벌크 액션 및 행 액션 정의

### `table-utils.ts`
테이블 관련 유틸리티 함수:
- 설정 조회 함수
- 데이터 포맷팅 함수
- 검색/필터/정렬 함수
- 통계 계산 함수

## 마이그레이션 가이드

기존 코드에서 새로운 타입 시스템으로 마이그레이션할 때:

1. 기존 타입은 `Legacy` 접두사로 유지
2. 새로운 타입을 점진적으로 도입
3. 타입 가드를 사용하여 런타임 안전성 확보
4. 유효성 검사 함수로 데이터 품질 보장

## 개발 가이드라인

1. **새 테이블 추가 시**:
   - `models.ts`에 인터페이스 추가
   - `table-configs.ts`에 설정 추가
   - `type-guards.ts`에 타입 가드 추가

2. **새 기능 추가 시**:
   - 관련 타입을 적절한 파일에 정의
   - 타입 가드 및 유효성 검사 함수 구현
   - 유틸리티 함수 업데이트

3. **타입 변경 시**:
   - 하위 호환성 고려
   - 마이그레이션 가이드 업데이트
   - 테스트 코드 업데이트