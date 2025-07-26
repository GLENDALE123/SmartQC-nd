# 📸 이미지 업로드 설정 가이드

## 1. 환경 변수 설정

`backend/.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/smartqc_quality_control"

# JWT Configuration
JWT_SECRET="your-secret-key"

# Shared Folder Configuration for Image Upload
SHARED_FOLDER_PATH="\\\\서버명\\공유폴더명\\images"
SHARED_FOLDER_USERNAME="사용자명"
SHARED_FOLDER_PASSWORD="비밀번호"

# Image Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"
MAX_IMAGES_PER_INSPECTION=10
```

## 2. 공유폴더 정보 입력

다음 정보를 네트워크 관리자에게 문의하여 `.env` 파일에 입력하세요:

### 필수 정보:
- **서버명**: 공유폴더가 있는 서버의 이름 또는 IP 주소
- **공유폴더명**: 공유폴더의 이름
- **사용자명**: 공유폴더에 접근 권한이 있는 사용자명
- **비밀번호**: 해당 사용자의 비밀번호

### 예시:
```env
SHARED_FOLDER_PATH="\\\\192.168.1.100\\shared\\images"
SHARED_FOLDER_USERNAME="admin"
SHARED_FOLDER_PASSWORD="password123"
```

## 3. 서버 시작 및 테스트

### 백엔드 서버 시작:
```bash
cd backend
npm run start:dev
```

### 연결 테스트:
브라우저에서 다음 URL로 접속하여 연결을 테스트하세요:
```
POST http://localhost:3001/api/image-upload/test/connection
```

## 4. API 엔드포인트

### 이미지 업로드:
```
POST /api/image-upload/:inspectionId
Content-Type: multipart/form-data
Body: { image: File }
```

### 이미지 삭제:
```
DELETE /api/image-upload/:inspectionId/:imageId?filePath=파일경로
```

### 이미지 목록 조회:
```
GET /api/image-upload/:inspectionId
```

## 5. 폴더 구조

업로드된 이미지는 다음 구조로 저장됩니다:
```
Z:\images\inspections\
├── 1\                    # 검사 ID별 폴더
│   ├── 1703123456789-image1.jpg
│   └── 1703123456790-image2.jpg
└── 2\
    └── 1703123456791-image1.jpg
```

## 6. 문제 해결

### 공유폴더 접근 실패:
1. 네트워크 연결 확인
2. 사용자명/비밀번호 확인
3. 공유폴더 권한 확인
4. 방화벽 설정 확인

### 이미지 업로드 실패:
1. 파일 크기 확인 (5MB 이하)
2. 파일 형식 확인 (JPEG, PNG, WebP)
3. 파일명 특수문자 확인

## 7. 보안 고려사항

- 공유폴더 접근 권한은 최소한으로 설정
- 정기적인 비밀번호 변경
- 접근 로그 모니터링
- 백업 정책 수립 