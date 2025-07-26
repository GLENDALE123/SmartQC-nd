# SmartQC Git 브랜치 전략 및 워크플로우

## 브랜치 구조

```
master (안정 버전 배포용)
├── develop (개발용)
│   ├── frontend (프론트엔드 전용)
│   └── feature/* (기능별 브랜치)
└── hotfix/* (긴급 수정)
```

## 브랜치별 역할

### 🌟 master 브랜치
- **목적**: 안정 버전 배포용
- **특징**: 
  - 항상 배포 가능한 상태 유지
  - 직접적인 커밋 금지
  - develop 브랜치에서 merge만 허용
  - 태그를 통한 버전 관리

### 🔧 develop 브랜치
- **목적**: 개발용 통합 브랜치
- **특징**:
  - 모든 기능 개발의 통합 지점
  - feature 브랜치에서 merge
  - 테스트 완료 후 master로 merge

### 🎨 frontend 브랜치
- **목적**: 프론트엔드 전용 개발
- **특징**:
  - UI/UX 관련 작업 전용
  - develop 브랜치에서 분기
  - 완료 후 develop로 merge

### 🚀 feature 브랜치
- **목적**: 개별 기능 개발
- **네이밍**: `feature/기능명` (예: `feature/user-authentication`)
- **특징**:
  - develop 브랜치에서 분기
  - 단일 기능에 집중
  - 완료 후 develop로 merge

### 🔥 hotfix 브랜치
- **목적**: 긴급 버그 수정
- **네이밍**: `hotfix/버그명` (예: `hotfix/critical-login-bug`)
- **특징**:
  - master 브랜치에서 분기
  - 긴급 수정 후 master와 develop 모두에 merge

## 워크플로우

### 1. 새로운 기능 개발 시작
```bash
# develop 브랜치로 이동
git checkout develop
git pull origin develop

# feature 브랜치 생성
git checkout -b feature/new-feature-name

# 개발 작업...
git add .
git commit -m "feat: 새로운 기능 추가"

# develop로 merge
git checkout develop
git merge feature/new-feature-name
git push origin develop

# feature 브랜치 삭제
git branch -d feature/new-feature-name
```

### 2. 프론트엔드 작업
```bash
# develop에서 frontend 브랜치로 이동
git checkout develop
git pull origin develop
git checkout frontend

# UI/UX 작업...
git add .
git commit -m "feat: 새로운 UI 컴포넌트 추가"

# develop로 merge
git checkout develop
git merge frontend
git push origin develop
```

### 3. 배포 준비
```bash
# develop에서 master로 merge
git checkout master
git pull origin master
git merge develop
git push origin master

# 버전 태그 생성
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### 4. 긴급 수정
```bash
# master에서 hotfix 브랜치 생성
git checkout master
git checkout -b hotfix/critical-bug

# 수정 작업...
git add .
git commit -m "fix: 긴급 버그 수정"

# master와 develop 모두에 merge
git checkout master
git merge hotfix/critical-bug
git push origin master

git checkout develop
git merge hotfix/critical-bug
git push origin develop

# hotfix 브랜치 삭제
git branch -d hotfix/critical-bug
```

## 커밋 메시지 규칙

### 커밋 타입
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스 또는 보조 도구 변경

### 예시
```
feat: 사용자 인증 기능 추가
fix: 로그인 폼 유효성 검사 오류 수정
docs: API 문서 업데이트
style: 코드 포맷팅 정리
refactor: 컴포넌트 구조 개선
test: 사용자 인증 테스트 추가
chore: 의존성 패키지 업데이트
```

## 브랜치 보호 규칙

### master 브랜치
- 직접 push 금지
- Pull Request 필수
- 코드 리뷰 필수
- CI/CD 테스트 통과 필수

### develop 브랜치
- Pull Request 권장
- 코드 리뷰 권장
- 테스트 통과 필수

## 협업 가이드라인

### 1. 브랜치 생성 전
- 현재 작업 중인 이슈 확인
- 다른 개발자와 작업 영역 충돌 방지

### 2. 커밋 전
- 코드 스타일 검사
- 테스트 실행
- 불필요한 파일 제외

### 3. Merge 전
- 코드 리뷰 요청
- 충돌 해결
- 테스트 완료 확인

### 4. 배포 전
- 전체 테스트 실행
- 문서 업데이트
- 버전 태그 생성

## 유용한 Git 명령어

```bash
# 브랜치 상태 확인
git status
git branch -a

# 변경사항 확인
git diff
git log --oneline

# 브랜치 간 차이점 확인
git diff develop..feature/new-feature

# 원격 저장소 동기화
git fetch origin
git pull origin develop

# 작업 중인 변경사항 임시 저장
git stash
git stash pop

# 커밋 히스토리 정리
git rebase -i HEAD~3
```

## 주의사항

1. **master 브랜치 직접 수정 금지**
2. **긴 시간 동안 브랜치 유지 금지**
3. **커밋 메시지는 명확하고 구체적으로 작성**
4. **Merge 전 충돌 해결 필수**
5. **정기적인 develop 브랜치 동기화** 