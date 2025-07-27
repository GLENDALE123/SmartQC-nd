# Implementation Plan

- [ ] 1. 데이터베이스 스키마 수정 및 마이그레이션


  - 현재 배치 중심 구조를 프론트엔드 요구사항에 맞게 수정
  - User 모델에 inspectionType, processLine, authType, lastLoginAt 필드 추가
  - 검사 모델들에 주문 정보 직접 포함 (orderNumbers 배열, client, productName, partName, specification, manager)
  - batchId 필드 완전 제거하여 배치 없이 직접 검사 생성 지원
  - 기존 스키마 (DefectType, QualityHistory, ExcelOrder, Attachment 등) 유지
  - _Requirements: 8.2, 8.3, 8.5_

- [x] 2. 공통 응답 구조 및 에러 처리 시스템 구현


  - ApiResponse, PaginatedResponse, ErrorResponse 인터페이스 구현
  - GlobalExceptionFilter 생성하여 표준화된 에러 응답 처리
  - 커스텀 예외 클래스들 생성 (ValidationException, BusinessLogicException 등)
  - _Requirements: 6.1, 6.2, 6.4_

- [x] 3. 주문 정보 조회 API 구현




- [x] 3.1 OrderController 및 OrderService 생성









  - GET /orders/search?orderNumbers=T00000-1,T00000-2 엔드포인트 구현
  - 발주번호 배열을 받아 Order 테이블(ExcelOrder)에서 주문 정보 조회
  - 주문 정보 응답 DTO 생성 (OrderInfoResponseDto)
  - _Requirements: 3.1, 3.2_



- [x] 3.2 주문 정보 조회 로직 최적화






  - 발주번호 형식 검증 (orderNumber 필드 기반)
  - 여러 발주번호 일괄 조회 성능 최적화
  - 존재하지 않는 발주번호에 대한 적절한 응답 처리
  - _Requirements: 3.1, 7.2_






- [x] 4. 검사 생성 DTO 및 API 재구축



- [x] 4.1 검사 생성 DTO 수정







  - CreateIncomingInspectionDto에서 batchId 제거, orderNumbers 및 주문 정보 필드 추가
  - CreateProcessInspectionDto, CreateShipmentInspectionDto 동일 수정
  - 주문 정보 필드들 추가 (client, productName, partName, specification, manager)






  - 멀티파트 파일 업로드 지원 유지
  - _Requirements: 2.1, 2.4, 8.2_

- [x] 4.2 IncomingInspectionService 수정



  - create 메서드에서 orderNumbers 기반으로 검사 생성 (batchId 로직 제거)


  - findByBatchId, updateByBatchId 메서드 제거
  - getReferences 메서드를 orderNumbers 기반으로 수정
  - 파일 업로드 처리 로직 유지
  - _Requirements: 2.1, 2.2, 8.2, 8.3_

- [x] 4.3 ProcessInspectionService 수정





  - IncomingInspectionService와 동일한 패턴으로 수정
  - batchId 관련 메서드들 제거
  - 공정검사 특화 필드들 (paintPrimer, paintTopcoat, line 등) 처리 유지
  - rounds 데이터 생성 로직 유지
  - _Requirements: 2.1, 2.2_



- [x] 4.4 ShipmentInspectionService 수정


  - batchId 관련 메서드들 제거
  - 출하검사 특화 구조 (rounds, workers, defects) 처리 유지
  - 복잡한 중첩 데이터 구조 생성 로직 유지
  - _Requirements: 2.1, 2.2_

- [x] 4.5 검사 Controller 수정



  - IncomingInspectionController에서 batch 관련 엔드포인트 제거
  - ProcessInspectionController, ShipmentInspectionController 동일 수정
  - 멀티파트 데이터 처리 로직 유지
  - _Requirements: 2.1, 2.4_

- [x] 5. 통합 검사 조회 API 구현





- [x] 5.1 최근 검사 이력 조회 API 구현


  - GET /inspections/recent 엔드포인트 구현
  - orderNumber, productName, partName, type, limit 필터링 지원
  - 검사 유형별 통합 조회 로직 구현 (incoming, process, shipment)
  - 페이지네이션 지원
  - _Requirements: 3.1, 3.2, 6.3_

- [x] 5.2 검사 상세 조회 API 구현


  - GET /inspections/:id?type=incoming 엔드포인트 구현
  - 검사 유형별 적절한 include 관계 설정
  - 불량 데이터, 첨부파일, 주문 정보 포함
  - _Requirements: 2.2, 7.2_

- [x] 5.3 검사 참고 이력 조회 개선


  - 기존 InspectionController의 getReferences 메서드 개선
  - orderNumbers 기반 관련 검사 이력 조회로 변경
  - 데이터베이스 쿼리 최적화
  - _Requirements: 3.1, 3.2, 8.5_

- [x] 6. 불량 유형 관리 API 개선




- [x] 6.1 DefectTypesController 및 Service 개선


  - 기존 구현 검토 및 표준 CRUD 패턴 적용
  - GET /defect-types (전체 조회)
  - POST /defect-types (생성)
  - PUT /defect-types/:id (수정)
  - DELETE /defect-types/:id (삭제)
  - _Requirements: 4.1, 4.2_

- [x] 6.2 불량 유형 색상 정보 처리 개선


  - 색상 필드 검증 및 저장 로직 강화
  - 프론트엔드 시각적 구분을 위한 색상 정보 응답
  - _Requirements: 4.3_



- [x] 7. 인증 시스템 개선






- [x] 7.1 JWT 토큰 및 사용자 정보 개선








  - JWT 토큰에 inspectionType, processLine 정보 포함
  - lastLoginAt 필드 업데이트 로직 추가
  - 사용자별 검사 권한 관리 로직 구현
  - _Requirements: 5.1, 5.2, 5.3, 8.1_

- [x] 7.2 토큰 갱신 및 로그아웃 API 구현









  - POST /auth/refresh 엔드포인트 구현
  - POST /auth/logout 엔드포인트 구현
  - 토큰 만료 처리 개선
  - _Requirements: 5.2_


- [x] 8. 파일 업로드 시스템 개선















- [x] 8.1 멀티파트 데이터 처리 최적화




  - 기존 FileFieldsInterceptor 로직 개선

  - JSON 데이터와 파일 동시 처리 에러 핸들링 강화
  - 파일 크기 및 형식 검증 강화

  - _Requirements: 2.4, 6.4, 8.4_

- [x] 8.2 이미지 업로드 API 통합



  - POST /uploads/images 엔드포인트 구현
  - GET /uploads/images/:inspectionId 엔드포인트 구현

  - 기존 SharedFolderService와 통합
  - _Requirements: 2.4, 8.4_

- [x] 9. API 문서화 및 모니터링



- [x] 9. API 문서화 및 모니터링
- [x] 9.1 Swagger 문서 자동 생성 설정

  - 모든 엔드포인트에 대한 정확한 스키마 문서화

  - 요청/응답 예시 추가

  - 에러 응답 문서화

  - _Requirements: 9.2_

- [x] 9.2 API 응답 시간 모니터링 설정

  - 개발 환경에서 성능 메트릭 수집


  - 로깅 시스템 개선
  - _Requirements: 9.1, 9.3_


- [ ] 10. 데이터베이스 마이그레이션 및 최적화




- [ ] 10.1 기존 데이터 보존 마이그레이션 스크립트 작성


  - 기존 검사 데이터에 주문 정보 매핑
  - 배치 정보에서 주문 정보 추출하여 검사 테이블에 복사
  - 데이터 무결성 검증
  - _Requirements: 8.6, 9.4_


- [ ] 10.2 인덱스 최적화

  - orderNumbers 배열 필드에 대한 GIN 인덱스 추가
  - 검사 이력 조회 성능 최적화를 위한 복합 인덱스 생성
  - productName, partName, client 필드 인덱스 추가
  - _Requirements: 8.5_

- [ ] 11. 통합 테스트 및 API 계약 검증


- [ ] 11.1 프론트엔드-백엔드 타입 동기화 테스트
  - 모든 DTO와 프론트엔드 타입 정의 일치 검증
  - API 응답 구조 검증 테스트 작성
  - _Requirements: 1.1, 1.2, 1.3, 7.1_

- [ ] 11.2 E2E 테스트 작성
  - 검사 생성 플로우 전체 테스트 (orderNumbers 기반)

  - 파일 업로드 포함 멀티파트 요청 테스트
  - 에러 시나리오 테스트
  - _Requirements: 2.1, 2.4, 6.1, 6.2_

- [ ] 11.3 성능 테스트 및 최적화
  - 검사 이력 조회 성능 테스트
  - 대용량 파일 업로드 테스트
  - 동시 요청 처리 테스트
  - _Requirements: 3.2, 8.5_


- [ ] 12. 프로덕션 배포 준비

- [ ] 12.1 환경 설정 및 보안 강화
  - 프로덕션 환경 변수 설정
  - CORS 설정 최적화
  - 보안 헤더 설정
  - _Requirements: 5.1, 5.3_

- [ ] 12.2 로깅 및 모니터링 시스템 구축
  - 구조화된 로깅 시스템 구현
  - API 호출 추적 및 성능 모니터링
  - 에러 알림 시스템 구축
  - _Requirements: 9.1, 9.3_