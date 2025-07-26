# Frontend SmartQC

SmartQC 프론트엔드 애플리케이션입니다.

## 🚀 주요 기능

- **품질 검사 관리**: 입고검사, 공정검사, 출하검사
- **불량 유형 관리**: 불량 유형 정의 및 통계
- **리포트 생성**: 검사 결과 리포트 및 통계
- **사용자 관리**: 권한별 접근 제어
- **설정 관리**: 검사 설정 및 알림 설정

## 🛠 기술 스택

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Icons**: Tabler Icons
- **Forms**: React Hook Form

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 타입 체크
npm run type-check
```

## 🎨 UI 컴포넌트

### FloatingLabel 컴포넌트

Flowbite 스타일을 참고한 다양한 floating label 스타일을 지원하는 컴포넌트입니다.

#### 기본 사용법

```tsx
import { FloatingLabel } from '@/components/ui/floating-label'

// 기본 사용법
<FloatingLabel
  label="이메일"
  variant="filled"
  type="email"
  placeholder="이메일을 입력하세요"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | 라벨 텍스트 (필수) |
| `variant` | `'filled' \| 'outlined' \| 'standard'` | `'filled'` | 스타일 변형 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 크기 |
| `helperText` | `string` | - | 도움말 텍스트 |
| `error` | `boolean` | `false` | 에러 상태 |
| `disabled` | `boolean` | `false` | 비활성화 상태 |

#### 스타일 예시

```tsx
// 에러 상태
<FloatingLabel
  label="비밀번호"
  variant="outlined"
  type="password"
  error={true}
  helperText="비밀번호는 8자 이상이어야 합니다."
/>

// 크기 조정
<FloatingLabel
  label="작은 입력"
  variant="standard"
  size="small"
/>

// 비활성화
<FloatingLabel
  label="읽기 전용"
  variant="filled"
  disabled={true}
  value="수정할 수 없음"
/>
```

#### 데모 페이지

`FloatingLabelDemo` 컴포넌트를 통해 모든 스타일과 기능을 확인할 수 있습니다:

```tsx
import { FloatingLabelDemo } from '@/components/ui/floating-label-demo'

<FloatingLabelDemo />
```

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── ui/                    # shadcn/ui 컴포넌트
│   │   ├── floating-label.tsx # FloatingLabel 컴포넌트
│   │   └── ...
│   ├── inspection/            # 검사 관련 컴포넌트
│   └── settings/              # 설정 관련 컴포넌트
├── pages/                     # 페이지 컴포넌트
├── layouts/                   # 레이아웃 컴포넌트
├── hooks/                     # 커스텀 훅
├── store/                     # 상태 관리
├── utils/                     # 유틸리티 함수
└── types/                     # TypeScript 타입 정의
```

## 🔧 주요 기능

### 1. 검사 관리
- **입고검사**: 원자재 및 부품 입고 시 품질 검사
- **공정검사**: 생산 공정 중 품질 검사
- **출하검사**: 최종 제품 출하 전 품질 검사

### 2. 불량 관리
- **불량 유형 정의**: 색상, 표면, 크기, 박리, 기타
- **불량 통계**: 검사별 불량률 및 추이 분석
- **불량 이력**: 불량 발생 이력 관리

### 3. 설정 관리
- **요약 모드 설정**: 24시간 TTL이 적용된 로컬 스토리지 저장
- **알림 설정**: 검사 결과 알림 설정
- **사용자 설정**: 개인별 환경 설정

## 🎯 개발 가이드라인

### 컴포넌트 생성 규칙
1. **전역 컴포넌트**: `src/components/ui/` - 재사용 가능한 UI 컴포넌트
2. **기능별 컴포넌트**: `src/features/[featureName]/components/` - 특정 기능 전용
3. **페이지 컴포넌트**: `src/pages/` - 라우팅과 직접 연결되는 페이지

### 스타일링 규칙
- **Tailwind CSS**: 유틸리티 클래스 우선 사용
- **CSS Modules**: 컴포넌트별 스타일링 시 사용
- **디자인 토큰**: 하드코딩 금지, 변수 사용

### 상태 관리
- **로컬 상태**: `useState`, `useReducer`
- **전역 상태**: Zustand store
- **서버 상태**: React Query (필요시)

## 📝 환경 변수

```env
# API 설정
VITE_API_BASE_URL=http://localhost:8080/api

# 환경 구분
VITE_NODE_ENV=development

# 외부 서비스
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
```

## 🚀 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 확인
npm run preview
```

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
