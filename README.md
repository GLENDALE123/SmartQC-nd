# SmartQC - 품질 관리 시스템

SmartQC는 제품 품질 관리를 위한 통합 시스템입니다. 프론트엔드와 백엔드로 구성되어 있습니다.

## 프로젝트 구조

```
frontend-smartqc1/
├── backend/           # NestJS 백엔드 API
├── frontend-sqc/      # React + Vite 프론트엔드
└── README.md          # 프로젝트 문서
```

## 기술 스택

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: JWT
- **Language**: TypeScript

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui + Tailwind CSS
- **Language**: TypeScript
- **State Management**: Zustand
- **Routing**: React Router DOM

## 주요 기능

### 품질 검사 관리
- 입고 검사 (Incoming Inspection)
- 공정 검사 (Process Inspection)
- 출하 검사 (Shipment Inspection)
- 검사 배치 관리
- 불량 유형 관리

### 데이터 관리
- Excel 파일 업로드 및 처리
- 품질 이력 관리
- 이미지 업로드 및 관리
- 검사 결과 통계

### 사용자 관리
- JWT 기반 인증
- 사용자 프로필 관리
- 권한 관리

## 설치 및 실행

### Backend 실행
```bash
cd backend
npm install
npm run start:dev
```

### Frontend 실행
```bash
cd frontend-sqc
npm install
npm run dev
```

## 환경 설정

### Backend 환경 변수
- `DATABASE_URL`: PostgreSQL 데이터베이스 연결 문자열
- `JWT_SECRET`: JWT 토큰 암호화 키

### Frontend 환경 변수
- `VITE_API_BASE_URL`: 백엔드 API 기본 URL

## 개발 가이드

### 코드 컨벤션
- TypeScript 사용
- ESLint + Prettier 설정
- Feature-driven 아키텍처
- 컴포넌트 기반 개발

### Git 워크플로우
- Feature 브랜치 기반 개발
- Pull Request를 통한 코드 리뷰
- Conventional Commits 사용

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 