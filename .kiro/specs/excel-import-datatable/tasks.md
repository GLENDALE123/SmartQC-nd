# Implementation Plan

- [x] 1. shadcn-view-table GitHub 레포지토리 다운로드 및 설정





  - https://github.com/nainglinnkhant/shadcn-view-table 레포지토리 클론 또는 다운로드
  - 필요한 컴포넌트 파일들을 프로젝트에 복사 (components/ui/data-table 관련 파일들)
  - Next.js 전용 코드를 React/Vite 환경에 맞게 수정
  - 필요한 의존성 설치 (@tanstack/react-table, date-fns, lucide-react 등)
  - _Requirements: 1.1, 2.1_




- [x] 2. 다중 테이블 지원을 위한 데이터 타입 및 인터페이스 정의


  - Prisma 스키마 기반 모든 테이블 TypeScript 인터페이스 정의 (Order, User, DefectType, IncomingInspection 등)
  - 테이블 설정 및 메타데이터 타입 정의 (TableConfig, ColumnConfig 등)
  - API 응답 타입 정의
  - 다중 테이블 상태 관리 타입 정의
  - _Requirements: 1.2, 2.1_

- [x] 3. shadcn-view-table 컴포넌트를 React/Vite 환경에 맞게 수정





- [x] 3.1 Next.js 전용 코드 수정


  - Next.js의 useRouter, useSearchParams 등을 React Router 또는 상태 관리로 대체
  - Next.js Image 컴포넌트를 일반 img 태그로 변경
  - 서버 컴포넌트 관련 코드 제거 및 클라이언트 컴포넌트로 변환
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3.2 기존 DataTable 컴포넌트 구조 분석 및 정리


  - data-table.tsx, data-table-toolbar.tsx, data-table-pagination.tsx 등 파일 구조 파악
  - 컴포넌트 간 의존성 및 props 인터페이스 확인
  - 불필요한 기능 제거 및 필요한 기능 식별
  - _Requirements: 1.1, 1.3, 1.4, 6.1, 6.2_

- [x] 3.3 기존 스타일링 및 테마 적용


  - Tailwind CSS 클래스 확인 및 프로젝트 스타일에 맞게 조정
  - 다크/라이트 테마 지원 확인
  - 반응형 디자인 검증
  - _Requirements: 2.4_

- [x] 4. 기존 컴포넌트를 우리 요구사항에 맞게 커스터마이징









- [x] 4.1 기존 DataTableToolbar 컴포넌트 수정


  - 기존 검색 기능 유지 및 한국어 플레이스홀더 적용
  - 기존 필터 기능을 Order 스키마에 맞게 수정
  - DateRangePicker 기능 추가 (기존 코드에 없다면)
  - Export 버튼 기능 확인 및 수정
  - _Requirements: 3.1, 3.2, 3.3, 5.4_

- [x] 4.2 기존 DataTableViewOptions (Columns) 컴포넌트 수정


  - 기존 열 가시성 토글 기능 확인
  - Order 테이블 컬럼에 맞게 수정
  - 한국어 컬럼명 적용
  - _Requirements: 5.1_

- [x] 4.3 기존 DataTableFacetedFilter 컴포넌트 수정


  - 기존 필터 로직을 Order 스키마에 맞게 수정
  - 진행상태, 분류, 구분 등 Order 필드 기반 필터 옵션 설정
  - 한국어 필터 옵션 적용
  - _Requirements: 3.4_

- [x] 4.4 DateRangePicker 기능 추가 (기존에 없다면)


  - shadcn/ui calendar 컴포넌트 활용
  - 프리셋 날짜 범위 옵션 구현
  - createdAt, shippingDate 필드 필터링 연동
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4.5 기존 DataTableRowActions 컴포넌트 수정


  - 기존 행 액션 메뉴 확인
  - Order 데이터에 적합한 액션으로 수정 (보기, 편집, 삭제 등)
  - 한국어 액션 라벨 적용
  - _Requirements: 5.3_

- [x] 5. 다중 테이블 지원 컴포넌트 구현







- [x] 5.0 다중 테이블 지원 구조 준비 (미래 확장성용)


  - TableSelector 컴포넌트 구조만 준비 (실제 사용은 안 함)
  - 다중 테이블 설정 타입 및 인터페이스 정의
  - 향후 다른 프로젝트에서 재사용 가능하도록 구조만 구축
  - 현재는 Order 테이블만 사용하도록 설정
  - _Requirements: 5.1_

- [ ] 5. 테이블별 전용 컴포넌트 구현
- [x] 5.1 다중 테이블 컬럼 정의 구현


  - Order 테이블 컬럼 정의 (발주번호, 코드, 발주처, 제품명, 부속명, 발주수량, 사양, 진행상태, 출하일, 담당, 단가, 발주금액 등)
  - User 테이블 컬럼 정의 (사용자명, 이름, 역할, 활성상태, 마지막 로그인 등)
  - DefectType 테이블 컬럼 정의 (이름, 설명, 색상 등)
  - IncomingInspection 테이블 컬럼 정의 (검사일, 발주처, 제품명, 상태 등)
  - 공통 셀 컴포넌트 (상태 배지, 통화 포맷, 날짜 포맷, 체크박스 등)
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 5.2 OrderDataTable 메인 컴포넌트 구현




  - Order 테이블 전용 DataTable 컴포넌트 구현
  - Order 스키마에 맞는 컬럼 설정 및 데이터 표시
  - 검색, 필터링, 정렬, 페이지네이션 기능 구현
  - 다중 테이블 구조는 준비해두되 Order만 실제 사용
  - _Requirements: 1.1, 1.2, 1.3, 1.4_


- [ ] 6. 테스트 페이지 구현




- [x] 6.1 기존 데모 페이지를 테스트 페이지로 활용

  - 기존 shadcn-view-table의 메인 페이지를 우리 프로젝트에 맞게 수정
  - 기존 레이아웃과 스타일 유지하면서 데이터만 교체
  - 모든 DataTable 기능 테스트 환경 구축
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

- [x] 6.2 Order 테이블 Mock 데이터 및 테스트 환경 구축


  - Order Prisma 모델 구조에 맞는 Mock 데이터 생성
  - Order DataTable 기능 테스트를 위한 테스트 페이지 구성
  - 다양한 Order 데이터 시나리오 테스트 환경
  - 다중 테이블 Mock 구조는 준비해두되 Order만 실제 사용
  - _Requirements: 1.1, 1.3, 1.4_
- [x] 7. 스타일링 및 테마 적용



- [ ] 7. 스타일링 및 테마 적용

- [x] 7.1 DataTable 컴포넌트 스타일링


  - Tailwind CSS 클래스를 활용한 스타일링
  - 다크/라이트 테마 지원
  - 반응형 디자인 구현
  - _Requirements: 6.1, 6.2_

- [x] 7.2 재사용 가능한 CSS 클래스 정의


  - 컴포넌트별 기본 스타일 클래스 정의
  - 커스터마이징 가능한 variant 클래스 생성
  - 접근성을 고려한 스타일 적용
  - _Requirements: 6.3, 6.4_

- [x] 8. Order 테이블 실제 API 연동





- [x] 8.1 Order API 서비스 구현


  - 실제 백엔드 Order API와 연동
  - 검색, 필터링, 정렬, 페이지네이션 API 호출
  - 에러 처리 및 로딩 상태 관리
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 8.2 Order 데이터 내보내기 기능 구현


  - Order 데이터 CSV/Excel 내보내기
  - 필터링된 데이터 내보내기 지원
  - 선택된 행만 내보내기 기능
  - _Requirements: 5.2_

- [ ] 9. 엑셀 가져오기 페이지에 Order DataTable 통합






- [ ] 9.1 엑셀 가져오기 페이지에 OrderDataTable 추가



  - 엑셀 가져오기 컴포넌트 하단에 Order DataTable 배치
  - Order 테이블 데이터만 표시 (다중 테이블 기능은 사용 안 함)
  - 페이지 레이아웃 조정 및 스타일 통합
  - _Requirements: 1.1_

- [ ] 9.2 Order DataTable 기능 완성 및 테스트
  - Order 데이터 표시, 검색, 필터링, 정렬, 페이지네이션 기능 검증
  - 실제 사용 시나리오 테스트
  - 성능 및 사용성 최적화
  - _Requirements: 6.3, 6.4_