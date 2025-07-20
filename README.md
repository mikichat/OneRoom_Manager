# 원룸 임대 관리 프로그램 (OneRoom Manager)

## 📋 프로젝트 개요
학생 전용 원룸 임대업을 위한 웹 기반 관리 시스템입니다. 약 100개의 원룸을 효율적으로 관리하며, 계약 관리, 알림 서비스, 옵션 관리 등 종합적인 임대 관리 기능을 제공합니다.

## 🛠 기술 스택

### Backend
- **Framework**: Node.js + Express.js
- **Database**: SQLite3 (빠른 개발 및 배포)
- **ORM**: Sequelize (Node.js)
- **Authentication**: JWT 기반 인증

### Frontend
- **Framework**: Vue.js 3 + Vuetify
- **State Management**: Vuex (Vue)
- **Build Tool**: Vite
- **Charting**: Chart.js, Vue-Chartjs

### 확장 서비스
- **SMS 서비스**: 네이버 클라우드 플랫폼 SENS 또는 KT SMS API
- **카카오톡 알림**: 카카오 비즈니스 메시지 API
- **파일 업로드**: Multer 미들웨어 활용 (로컬 저장소 또는 AWS S3 연동 가능)
- **자동화된 작업**: `cronJobs.js`를 이용한 정기적인 작업 (예: 월세 납부 알림)

## 📊 데이터베이스 설계

### 테이블 구조

#### 1. buildings (건물 정보)
```sql
CREATE TABLE buildings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    total_floors INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. rooms (방 정보)
```sql
CREATE TABLE rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    building_id INTEGER NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    floor INTEGER NOT NULL,
    room_type ENUM('1룸', '2룸') NOT NULL,
    area DECIMAL(5,2),
    monthly_rent INTEGER NOT NULL,
    deposit INTEGER NOT NULL,
    status ENUM('임대가능', '임대중', '수리중') DEFAULT '임대가능',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id)
);
```

#### 3. room_options (방 옵션)
```sql
CREATE TABLE room_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    refrigerator BOOLEAN DEFAULT FALSE,
    washing_machine BOOLEAN DEFAULT FALSE,
    air_conditioner BOOLEAN DEFAULT FALSE,
    induction BOOLEAN DEFAULT FALSE,
    microwave BOOLEAN DEFAULT FALSE,
    tv BOOLEAN DEFAULT FALSE,
    wifi_router BOOLEAN DEFAULT FALSE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);
```

#### 4. tenants (임차인 정보)
```sql
CREATE TABLE tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    birth_first_six VARCHAR(6),
    emergency_contact VARCHAR(20),
    emergency_name VARCHAR(50),
    is_student BOOLEAN DEFAULT TRUE,
    school_name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. contracts (계약 정보)
```sql
CREATE TABLE contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    tenant_id INTEGER NOT NULL,
    contract_start_date DATE NOT NULL,
    contract_end_date DATE NOT NULL,
    monthly_rent INTEGER NOT NULL,
    deposit INTEGER NOT NULL,
    contract_image_path TEXT,
    contract_status ENUM('활성', '만료', '해지') DEFAULT '활성',
    special_terms TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

#### 6. rent_payments (월세 납부 내역)
```sql
CREATE TABLE rent_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER NOT NULL,
    payment_date DATE NOT NULL,
    amount INTEGER NOT NULL,
    payment_method ENUM('현금', '계좌이체', '카드') DEFAULT '계좌이체',
    payment_status ENUM('완료', '미납', '연체') DEFAULT '미납',
    due_date DATE NOT NULL,
    memo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
);
```

#### 7. notifications (알림 내역)
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER NOT NULL,
    type ENUM('SMS', '카카오톡', '이메일') NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    sent_at DATETIME,
    status ENUM('대기', '발송완료', '실패') DEFAULT '대기',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
);
```

#### 8. users (사용자 정보) - 역할 추가
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user' NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 핵심 기능

### 1. 방 관리
- ✅ 방 등록/수정/삭제
- ✅ 방 타입 설정 (1룸, 2룸)
- ✅ 층수, 호실 관리
- ✅ 방 옵션 관리 (냉장고, 세탁기, 에어컨, 인덕션, 전자레인지, TV, 공유기)
- ✅ 방 상태 관리 (임대가능, 임대중, 수리중)
- ✅ 방 사진 업로드

### 2. 계약 관리
- ✅ 계약 등록/수정/해지
- ✅ 계약 기간 설정 (6개월, 1년)
- ✅ 보증금, 월세 설정
- ✅ 계약서 이미지 업로드
- ✅ 계약 만료 알림
- ✅ 계약 연장 처리

### 3. 임차인 관리
- ✅ 임차인 정보 등록/수정/삭제
- ✅ 임차인 검색 및 학생 여부 필터링 기능
- ✅ 이메일, 주민번호 앞 6자리
- ✅ 학생 정보 (학교명)
- ✅ 비상연락처 관리
- ✅ 임차인 히스토리 조회

### 4. 월세 관리
- ✅ 월세 납부 내역 관리
- ✅ 연체 관리
- ✅ 월세 납부 예정 자동 알림 (5일 전, 1일 전)
- ✅ 월세 수납 현황 대시보드
- ✅ 월별 수익 보고서
- ✅ 월세 관리 CRUD 화면 (UI/UX 개선, 검색, 필터링, 유효성 검사, 알림 포함)

### 5. 알림 서비스
- ✅ SMS 문자 발송
- ✅ 카카오톡 알림 발송
- ✅ 계약 만료 알림
- ✅ 월세 납부 알림
- ✅ 연체 알림

### 6. 사용자 및 권한 관리
- ✅ JWT 토큰 기반 인증 (로그인/회원가입)
- ✅ 역할 기반 접근 제어 (Admin/User)
- ✅ 관리자만 접근 가능한 기능 및 UI 요소 (방/세입자/계약/월세 관리 CRUD, 방 옵션 관리)

## 📱 주요 화면 구성

### 1. 대시보드
- 전체 방 현황 (임대중/공실)
- 이번 달 수납 현황
- 계약 만료 예정 리스트
- 연체 현황
- 월별 수입 통계 (지난 12개월)
- 예정된 납부 내역
- ✅ 주요 현황 요약 카드 (아이콘, 강조된 수치 포함)

### 2. 방 관리
- 방 목록 (필터링, 검색)
- 방 등록/수정 폼
- 방 상세 정보

### 3. 방 옵션 관리
- 방 옵션 목록 (Room ID로 검색)
- 방 옵션 등록/수정 폼
- 방 옵션 상세 정보

### 4. 계약 관리
- 계약 목록
- 계약 등록/수정 폼
- 계약 상세 정보
- 계약서 이미지 뷰어

### 5. 임차인 관리
- 임차인 목록 (이름, 전화번호, 이메일 검색, 학생 여부 필터링)
- 임차인 등록/수정 폼
- 임차인 상세 정보
- 임차인 계약 히스토리

### 6. 월세 관리
- 월세 수납 현황
- 연체 관리
- 납부 내역 조회
- 수납 통계
- ✅ 월세 납부 내역 테이블 (검색, 필터링 기능)
- ✅ 월세 등록/수정/삭제 다이얼로그 (유효성 검사, 계약 선택 드롭다운)

### 7. 알림 관리
- 알림 발송 이력
- 알림 템플릿 관리
- 자동 알림 설정

### 8. 보고서
- 월별 수익 보고서 (연도별 조회, 상세 납부 내역 포함)
- ✅ 월별 수익 차트 (Chart.js)

## 🔧 구현 우선순위

### Phase 1 (기본 기능)
1. ✅ 데이터베이스 설계 및 구축
2. ✅ 사용자 인증 시스템
3. ✅ 방 관리 기능
4. ✅ 임차인 관리 기능
5. ✅ 기본 계약 관리 기능

### Phase 2 (핵심 기능)
1. ✅ 월세 관리 기능
2. ✅ 대시보드 구현
3. 파일 업로드 기능
4. ✅ 검색 및 필터링 기능

### Phase 3 (확장 기능)
1. SMS 알림 서비스 연동
2. 카카오톡 알림 서비스 연동
3. 자동 알림 시스템
4. 통계 및 리포트 기능

### 추가 완료된 기능
- ✅ UI/UX 개선 및 스타일링 (월세 관리, 대시보드)
- ✅ Chart.js 통합 (월별 수익 보고서)

## 📋 API 설계

### 사용자 인증 API
```
POST   /api/auth/register      - 사용자 등록 (기본 역할: user)
POST   /api/auth/login         - 로그인 (JWT 토큰 및 사용자 역할 반환)
```

### 방 관리 API
```
GET    /api/rooms              - 방 목록 조회 (인증 필요)
POST   /api/rooms              - 방 등록 (Admin 권한 필요)
GET    /api/rooms/:id          - 방 상세 조회 (인증 필요)
PUT    /api/rooms/:id          - 방 정보 수정 (Admin 권한 필요)
DELETE /api/rooms/:id          - 방 삭제 (Admin 권한 필요)
```

### 방 옵션 관리 API
```
GET    /api/room-options       - 방 옵션 목록 조회 (Room ID로 필터링 가능, 인증 필요)
POST   /api/room-options       - 방 옵션 등록 (Admin 권한 필요)
GET    /api/room-options/:id   - 방 옵션 상세 조회 (인증 필요)
PUT    /api/room-options/:id   - 방 옵션 정보 수정 (Admin 권한 필요)
DELETE /api/room-options/:id   - 방 옵션 삭제 (Admin 권한 필요)
```

### 계약 관리 API
```
GET    /api/contracts          - 계약 목록 조회 (인증 필요)
POST   /api/contracts          - 계약 등록 (Admin 권한 필요)
GET    /api/contracts/:id      - 계약 상세 조회 (인증 필요)
PUT    /api/contracts/:id      - 계약 정보 수정 (Admin 권한 필요)
DELETE /api/contracts/:id      - 계약 해지 (Admin 권한 필요)
```

### 임차인 관리 API
```
GET    /api/tenants            - 임차인 목록 조회 (검색 및 필터링 가능, 인증 필요)
POST   /api/tenants            - 임차인 등록 (Admin 권한 필요)
GET    /api/tenants/:id        - 임차인 상세 조회 (인증 필요)
PUT    /api/tenants/:id        - 임차인 정보 수정 (Admin 권한 필요)
DELETE /api/tenants/:id        - 임차인 삭제 (Admin 권한 필요)
```

### 대시보드 API
```
GET    /api/dashboard          - 대시보드 요약 정보 조회 (인증 필요)
```

### 월세 관리 API
```
GET    /api/rent-payments      - 월세 납부 내역 목록 조회 (인증 필요)
POST   /api/rent-payments      - 월세 납부 내역 등록 (Admin 권한 필요)
GET    /api/rent-payments/:id  - 월세 납부 내역 상세 조회 (인증 필요)
PUT    /api/rent-payments/:id  - 월세 납부 내역 수정 (Admin 권한 필요)
DELETE /api/rent-payments/:id  - 월세 납부 내역 삭제 (Admin 권한 필요)
```

### 알림 서비스 API
```
POST   /api/notifications/sms  - SMS 발송 (Admin 권한 필요)
POST   /api/notifications/kakao - 카카오톡 알림 발송 (Admin 권한 필요)
GET    /api/notifications      - 알림 이력 조회 (인증 필요)
```

### 보고서 API
```
GET    /api/reports/monthly-income - 월별 수입 보고서 조회 (연도별 필터링 가능, 인증 필요)
```

## 🚀 설치 및 실행

### 개발 환경 설정
```bash
# 프로젝트 클론
git clone [repository-url]
cd oneroom-manager

# 의존성 설치
npm install
cd frontend && npm install chart.js vue-chartjs && cd .. # Chart.js 및 vue-chartjs 설치 추가

# 환경 변수 설정
cp .env.example .env

# 데이터베이스 초기화 및 샘플 데이터 삽입
npm run db:reset

# 개발 서버 실행 (백엔드 및 프론트엔드 동시 실행)
./run.bat # Windows 배치 파일
```

### 환경 변수 설정 (.env)
```
# Database
DB_PATH=./database/oneroom.db

# JWT Secret
JWT_SECRET=your-secret-key

# SMS Service
SMS_API_KEY=your-sms-api-key
SMS_API_SECRET=your-sms-api-secret

# Kakao API
KAKAO_API_KEY=your-kakao-api-key
KAKAO_ADMIN_KEY=your-kakao-admin-key

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10MB
```

## 📝 개발 가이드라인

### 코딩 규칙
- ESLint + Prettier 사용
- 함수명은 동사로 시작
- 변수명은 camelCase 사용
- 컴포넌트명은 PascalCase 사용

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 수정
refactor: 코드 리팩토링
test: 테스트 코드 추가
chore: 빌드 과정 또는 보조 기능 수정
```

## 📊 성능 최적화

### 데이터베이스 최적화
- 자주 사용되는 컬럼에 인덱스 추가
- 페이지네이션 구현
- 쿼리 최적화

### 프론트엔드 최적화
- 이미지 lazy loading
- 컴포넌트 code splitting
- 캐싱 전략 구현

## 🔒 보안 고려사항

### 데이터 보호
- 개인정보 암호화 저장
- 파일 업로드 보안 검증
- SQL Injection 방지

### 접근 제어
- JWT 토큰 기반 인증
- 역할 기반 접근 제어 (Admin/User)
- API rate limiting

## 🧪 테스트 계획

### 단위 테스트
- 모든 API 엔드포인트 테스트
- 비즈니스 로직 테스트
- 데이터베이스 쿼리 테스트

### 통합 테스트
- 사용자 플로우 테스트
- 알림 서비스 테스트
- 파일 업로드 테스트

## 📈 모니터링 및 로깅

### 로그 관리
- 에러 로그 수집
- 사용자 액션 로그
- 성능 모니터링

### 알림 시스템
- 시스템 오류 알림
- 성능 저하 알림
- 보안 이슈 알림

## 📞 지원 및 문의

### 개발자 연락처
- 이메일: [developer-email]
- 전화: [developer-phone]

### 사용자 가이드
- 사용법 동영상
- FAQ 문서
- 트러블슈팅 가이드

## 📄 라이선스
MIT License

## 🔄 업데이트 계획

### 향후 개선사항
- 모바일 앱 개발
- 자동 계약 갱신 시스템
- AI 기반 임차인 관리
- 블록체인 기반 계약 관리

🔧 추가 권장 사항
1. 기술적 세부사항

Node.js 버전 요구사항 명시 (예: Node.js 16.x 이상)
데이터베이스 백업 전략 추가
로그 로테이션 정책 명시
세션 관리 정책 (JWT 만료 시간 등)

2. 배포 및 운영 관련
bash# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# PM2를 사용한 프로세스 관리
npm install -g pm2
pm2 start ecosystem.config.js
3. 데이터베이스 관련

데이터 마이그레이션 전략 명시
시드 데이터 생성 스크립트 추가
백업 및 복원 절차 문서화

4. 보안 강화사항

CORS 설정 명시
HTTPS 설정 가이드
보안 헤더 설정 (helmet.js 사용)
입력 데이터 검증 전략 (joi, express-validator 등)

5. 모니터링 도구

Winston 로깅 라이브러리 추가
morgan HTTP 요청 로깅
helmet 보안 헤더 설정

6. 추가 환경 변수
env# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Settings
CORS_ORIGIN=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Session
SESSION_SECRET=your-session-secret
JWT_EXPIRES_IN=24h
7. 스크립트 추가
json{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "build": "npm run build:frontend",
    "build:frontend": "cd frontend && npm run build",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "db:migrate": "sequelize-cli db:migrate",
    "db:seed": "npx sequelize-cli db:seed:all",
    "db:migrate:undo:all": "npx sequelize-cli db:migrate:undo:all",
    "db:reset": "npm run db:migrate:undo:all && npm run db:migrate && npm run db:seed"
  }
}
8. 예외 처리 및 에러 관리

글로벌 에러 핸들러 구현
사용자 친화적 에러 메시지 정의
API 에러 응답 표준화

9. 성능 최적화 추가사항

Redis 캐싱 전략 (선택사항)
이미지 최적화 도구 (Sharp.js 등)
CDN 연동 방안

10. 문서화 개선

API 문서화 (Swagger/OpenAPI 3.0)
데이터베이스 ERD 다이어그램
아키텍처 다이어그램

---

**개발 시작일**: 2025년 7월
**목표 완료일**: 2025년 9월
**버전**: 1.0.0
