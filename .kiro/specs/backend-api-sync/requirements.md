# Requirements Document

## Introduction

이 프로젝트는 현재 프론트엔드(React + TypeScript)와 백엔드(NestJS + Prisma) 간의 API 불일치 문제를 해결하고, 프론트엔드 요구사항에 맞춰 백엔드 API를 전면 재구축하는 것을 목표로 합니다. 품질관리 시스템의 핵심 기능인 검사 생성, 조회, 수정 기능을 중심으로 완전한 API 동기화를 달성하여 향후 동시 개발이 가능한 환경을 구축합니다.

## Requirements

### Requirement 1

**User Story:** 개발자로서 프론트엔드와 백엔드 간의 API 계약이 일치하도록 하여 개발 효율성을 높이고 싶습니다.

#### Acceptance Criteria

1. WHEN 프론트엔드에서 API 호출을 수행할 때 THEN 백엔드는 프론트엔드가 기대하는 정확한 데이터 구조로 응답해야 합니다
2. WHEN 프론트엔드에서 데이터를 전송할 때 THEN 백엔드는 해당 데이터 구조를 올바르게 파싱하고 처리해야 합니다
3. WHEN API 엔드포인트가 호출될 때 THEN 프론트엔드 타입 정의와 백엔드 DTO가 완전히 일치해야 합니다

### Requirement 2

**User Story:** 품질관리 담당자로서 수입검사, 공정검사, 출하검사 데이터를 생성하고 조회할 수 있어야 합니다.

#### Acceptance Criteria

1. WHEN 검사 데이터를 생성할 때 THEN 시스템은 검사 유형별 특화된 필드들을 포함하여 저장해야 합니다
2. WHEN 배치 ID로 검사 데이터를 조회할 때 THEN 해당 검사의 모든 관련 데이터(불량 정보, 첨부파일 등)가 포함되어야 합니다
3. WHEN 검사 데이터를 수정할 때 THEN 기존 데이터를 유지하면서 변경사항만 업데이트되어야 합니다
4. WHEN 파일 첨부와 함께 검사 데이터를 전송할 때 THEN 멀티파트 데이터가 올바르게 처리되어야 합니다

### Requirement 3

**User Story:** 검사자로서 과거 검사 이력을 참조하여 현재 검사를 효율적으로 수행하고 싶습니다.

#### Acceptance Criteria

1. WHEN 주문번호, 제품명, 부속명으로 검색할 때 THEN 관련된 과거 검사 이력이 검사 유형별로 조회되어야 합니다
2. WHEN 최근 검사 기록을 요청할 때 THEN 필터링 옵션(검사 유형, 제품 정보 등)에 따라 정렬된 결과가 반환되어야 합니다
3. WHEN 배치 정보를 조회할 때 THEN 주문 정보와 품질 이력이 함께 제공되어야 합니다

### Requirement 4

**User Story:** 시스템 관리자로서 불량 유형을 관리하고 검사 데이터에서 활용할 수 있어야 합니다.

#### Acceptance Criteria

1. WHEN 불량 유형을 생성, 수정, 삭제할 때 THEN 변경사항이 즉시 검사 시스템에 반영되어야 합니다
2. WHEN 검사 데이터에서 불량 유형을 참조할 때 THEN 사전 정의된 불량 유형과 커스텀 불량 유형 모두 지원되어야 합니다
3. WHEN 불량 유형에 색상 정보가 포함될 때 THEN 프론트엔드에서 시각적으로 구분할 수 있어야 합니다

### Requirement 5

**User Story:** 개발자로서 인증 및 권한 시스템이 모든 API 엔드포인트에서 일관되게 작동해야 합니다.

#### Acceptance Criteria

1. WHEN 인증되지 않은 사용자가 API에 접근할 때 THEN 적절한 401 에러가 반환되어야 합니다
2. WHEN JWT 토큰이 만료되었을 때 THEN 프론트엔드가 이를 감지하고 재인증을 요청할 수 있어야 합니다
3. WHEN 사용자 권한에 따라 THEN 접근 가능한 API 엔드포인트가 제한되어야 합니다

### Requirement 6

**User Story:** 개발자로서 API 응답 형식이 일관되고 에러 처리가 표준화되어야 합니다.

#### Acceptance Criteria

1. WHEN API가 성공적으로 실행될 때 THEN 일관된 응답 구조(data, message, success)로 반환되어야 합니다
2. WHEN API 에러가 발생할 때 THEN 표준화된 에러 응답 구조로 반환되어야 합니다
3. WHEN 페이지네이션이 필요한 API일 때 THEN 표준화된 페이지네이션 응답 구조가 사용되어야 합니다
4. WHEN 파일 업로드 중 에러가 발생할 때 THEN 명확한 에러 메시지와 함께 적절한 HTTP 상태 코드가 반환되어야 합니다

### Requirement 7

**User Story:** 개발자로서 데이터베이스 스키마와 API 응답이 일치하여 데이터 무결성을 보장하고 싶습니다.

#### Acceptance Criteria

1. WHEN Prisma 스키마가 변경될 때 THEN 관련 DTO와 응답 타입이 자동으로 동기화되어야 합니다
2. WHEN 복잡한 관계형 데이터를 조회할 때 THEN 필요한 관련 데이터가 적절히 포함(include)되어야 합니다
3. WHEN 데이터 검증이 필요할 때 THEN class-validator를 통한 일관된 검증 규칙이 적용되어야 합니다

### Requirement 8

**User Story:** 개발자로서 데이터베이스 스키마가 프론트엔드 요구사항과 비즈니스 로직에 최적화되어야 합니다.

#### Acceptance Criteria

1. WHEN 사용자 모델을 사용할 때 THEN 프론트엔드에서 필요한 inspectionType 필드와 추가 권한 정보가 포함되어야 합니다
2. WHEN 검사 생성 API를 호출할 때 THEN 배치 개념 없이 발주번호 기반으로 직접 검사를 생성할 수 있어야 합니다
3. WHEN 기존 배치 중심 구조를 개선할 때 THEN 프론트엔드 UI 플로우에 맞게 검사와 주문 정보가 직접 연결되어야 합니다
4. WHEN 첨부파일 시스템을 사용할 때 THEN 파일 메타데이터와 실제 파일 경로가 안전하게 관리되어야 합니다
5. WHEN 검사 이력을 조회할 때 THEN 배치 정보 대신 주문 정보가 직접 포함되어 효율적인 쿼리가 가능해야 합니다
6. WHEN 엑셀 주문 데이터와 검사 데이터를 연결할 때 THEN 데이터 일관성과 참조 무결성이 보장되어야 합니다

### Requirement 9

**User Story:** 개발자로서 개발 및 디버깅을 위한 적절한 로깅과 문서화가 제공되어야 합니다.

#### Acceptance Criteria

1. WHEN API가 호출될 때 THEN 요청/응답 정보가 적절한 로그 레벨로 기록되어야 합니다
2. WHEN Swagger 문서를 확인할 때 THEN 모든 API 엔드포인트가 정확한 스키마와 예시로 문서화되어야 합니다
3. WHEN 개발 환경에서 THEN API 응답 시간과 성능 메트릭이 모니터링되어야 합니다
4. WHEN 데이터베이스 마이그레이션을 수행할 때 THEN 기존 데이터의 손실 없이 스키마 변경이 적용되어야 합니다