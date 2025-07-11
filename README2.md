# 원룸 임대 관리 프로그램 (OneRoom Manager)

## 📋 프로젝트 개요
학생 전용 원룸 임대업을 위한 웹 기반 관리 시스템입니다. 약 100개의 원룸을 효율적으로 관리하며, 계약 관리, 알림 서비스, 옵션 관리 등 종합적인 임대 관리 기능을 제공합니다.

## 🛠 기술 스택

### Backend
- **Framework**: Node.js + Express.js
- **Database**: SQLite3 (빠른 개발 및 배포)
- **ORM**: Sequelize (Node.js)
- **Authentication**: JWT 기반 인증
- **Logging**: Winston + Morgan
- **Security**: Helmet.js, CORS, Rate Limiting
- **Validation**: Joi 또는 express-validator

### Frontend
- **Framework**: Vue.js 3 + Vuetify
- **State Management**: Vuex (Vue)
- **Build Tool**: Vite

### 확장 서비스
- **SMS 서비스**: 네이버 클라우드 플랫폼 SENS 또는 KT SMS API
- **카카오톡 알림**: 카카오 비즈니스 메시지 API
- **파일 업로드**: Multer 미들웨어 + Sharp.js (이미지 최적화)
- **자동화된 작업**: `cronJobs.js`를 이용한 정기적인 작업 (예: 월세 납부 알림)
- **프로세스 관리**: PM2 (프로덕션 환경)
- **캐싱**: Redis (선택사항)

## ⚙️ 시스템 요구사항
- **Node.js**: 16.x 이상
- **NPM**: 8.x 이상
- **메모리**: 최소 2GB RAM
- **저장공간**: 최소 5GB 여유공간

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

### 7. 알림 관리
- 알림 발송 이력
- 알림 템플릿 관리
- 자동 알림 설정

### 8. 보고서
- 월별 수익 보고서 (연도별 조회, 상세 납부 내역 포함)

## 🔧 구현 우선순위

### Phase 1 (기본 기능)
1. 데이터베이스 설계 및 구축
2. 사용자 인증 시스템
3. 방 관리 기능
4. 임차인 관리 기능
5. 기본 계약 관리 기능

### Phase 2 (핵심 기능)
1. 월세 관리 기능
2. 대시보드 구현
3. 파일 업로드 기능
4. 검색 및 필터링 기능

### Phase 3 (확장 기능)
1. SMS 알림 서비스 연동
2. 카카오톡 알림 서비스 연동
3. 자동 알림 시스템
4. 통계 및 리포트 기능

### Phase 4 (보안 및 최적화)
1. 보안 강화 (Helmet.js, Rate Limiting)
2. 로깅 시스템 구축
3. 성능 최적화 및 캐싱
4. 모니터링 및 알림 시스템

## 📋 API 설계

### 사용자 인증 API
```
POST   /api/auth/register      - 사용자 등록 (기본 역할: user)
POST   /api/auth/login         - 로그인 (JWT 토큰 및 사용자 역할 반환)
POST   /api/auth/logout        - 로그아웃
GET    /api/auth/me            - 현재 사용자 정보 조회
```

### 방 관리 API
```
GET    /api/rooms              - 방 목록 조회 (인증 필요)
POST   /api/rooms              - 방 등록 (Admin 권한 필요)
GET    /api/rooms/:id          - 방 상세 조회 (인증 필요)
PUT    /api/rooms/:id          - 방 정보 수정 (Admin 권한 필요)
DELETE /api/rooms/:id          - 방 삭제 (Admin 권한 필요)
POST   /api/rooms/:id/images   - 방 이미지 업로드 (Admin 권한 필요)
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
POST   /api/contracts/:id/images - 계약서 이미지 업로드 (Admin 권한 필요)
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
GET    /api/dashboard/stats    - 통계 정보 조회 (인증 필요)
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
GET    /api/reports/occupancy      - 점유율 보고서 조회 (인증 필요)
```

## 🚀 설치 및 실행

### 개발 환경 설정
```bash
# 프로젝트 클론
git clone [repository-url]
cd oneroom-manager

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env

# 데이터베이스 초기화
npm run db:migrate

# 시드 데이터 생성 (선택사항)
npm run db:seed

# 개발 서버 실행
npm run dev
```

### 프로덕션 환경 배포
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# PM2를 사용한 프로세스 관리
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### 환경 변수 설정 (.env)
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
DB_PATH=./database/oneroom.db

# JWT Configuration
JWT_SECRET=your-very-secure-secret-key-here
JWT_EXPIRES_IN=24h

# Session Configuration
SESSION_SECRET=your-session-secret-key-here

# CORS Settings
CORS_ORIGIN=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# SMS Service
SMS_API_KEY=your-sms-api-key
SMS_API_SECRET=your-sms-api-secret

# Kakao API
KAKAO_API_KEY=your-kakao-api-key
KAKAO_ADMIN_KEY=your-kakao-admin-key

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# Redis (선택사항)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password
```

## 📦 Package.json 스크립트
```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "build": "npm run build:frontend",
    "build:frontend": "cd frontend && npm run build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "db:migrate": "sequelize-cli db:migrate",
    "db:seed": "sequelize-cli db:seed:all",
    "db:reset": "sequelize-cli db:migrate:undo:all && npm run db:migrate && npm run db:seed",
    "db:backup": "node scripts/backup-db.js",
    "db:restore": "node scripts/restore-db.js",
    "logs:clean": "node scripts/clean-logs.js",
    "health:check": "node scripts/health-check.js"
  }
}
```

## 🔒 보안 설정

### 보안 미들웨어 설정
```javascript
// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100개 요청
  message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
});
app.use('/api/', limiter);
```

### 데이터 보호
- 개인정보 암호화 저장 (bcrypt 사용)
- 파일 업로드 보안 검증
- SQL Injection 방지 (Sequelize ORM 사용)
- XSS 방지 (helmet.js 사용)

### 접근 제어
- JWT 토큰 기반 인증
- 역할 기반 접근 제어 (Admin/User)
- API rate limiting
- CORS 설정

## 📊 성능 최적화

### 데이터베이스 최적화
```sql
-- 자주 사용되는 컬럼에 인덱스 추가
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_contracts_status ON contracts(contract_status);
CREATE INDEX idx_tenants_phone ON tenants(phone);
CREATE INDEX idx_rent_payments_due_date ON rent_payments(due_date);
```

### 프론트엔드 최적화
- 이미지 lazy loading
- 컴포넌트 code splitting
- 캐싱 전략 구현
- 이미지 최적화 (Sharp.js 사용)

### 캐싱 전략
```javascript
// Redis를 사용한 캐싱 예시
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// 대시보드 데이터 캐싱 (5분)
const cacheDashboardData = async (data) => {
  await client.setex('dashboard:data', 300, JSON.stringify(data));
};
```

## 🧪 테스트 설정

### 테스트 구조
```
tests/
├── unit/           # 단위 테스트
│   ├── models/
│   ├── services/
│   └── utils/
├── integration/    # 통합 테스트
│   ├── api/
│   └── database/
└── e2e/           # E2E 테스트
    └── scenarios/
```

### Jest 설정 (jest.config.js)
```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/config/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
```

## 📈 모니터링 및 로깅

### Winston 로깅 설정
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

### 로그 관리
- 에러 로그 수집
- 사용자 액션 로그
- 성능 모니터링
- 로그 로테이션 (daily rotation)

### 헬스 체크
```javascript
// /api/health 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

## 🔄 백업 및 복원

### 데이터베이스 백업
```bash
# 자동 백업 스크립트
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
cp "./database/oneroom.db" "$BACKUP_DIR/oneroom_backup_$DATE.db"

# 오래된 백업 파일 삭제 (30일 이상)
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
```

### 파일 백업
```bash
# 업로드 파일 백업
tar -czf "./backups/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz" ./uploads/
```

## 📝 개발 가이드라인

### 코딩 규칙
- ESLint + Prettier 사용
- 함수명은 동사로 시작
- 변수명은 camelCase 사용
- 컴포넌트명은 PascalCase 사용
- 일관된 에러 처리 패턴 사용

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 수정
refactor: 코드 리팩토링
test: 테스트 코드 추가
chore: 빌드 과정 또는 보조 기능 수정
perf: 성능 개선
security: 보안 관련 수정
```

### 브랜치 전략
```
main        - 프로덕션 배포 브랜치
develop     - 개발 브랜치
feature/*   - 기능 개발 브랜치
hotfix/*    - 긴급 수정 브랜치
release/*   - 릴리즈 준비 브랜치
```

## 🛡️ 에러 처리 및 검증

### 글로벌 에러 핸들러
```javascript
// 글로벌 에러 처리 미들웨어
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: '서버 내부 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  }
});
```

### 입력 데이터 검증
```javascript
const Joi = require('joi');

const roomSchema = Joi.object({
  room_number: Joi.string().required(),
  floor: Joi.number().integer().min(1).required(),
  room_type: Joi.string().valid('1룸', '2룸').required(),
  monthly_rent: Joi.number().integer().min(0).required(),
  deposit: Joi.number().integer().min(0).required(),
});
```

## 📊 API 문서화

### Swagger 설정
```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '원룸 관리 API',
      version: '1.0.0',
      description: '원룸 임대 관리 시스템 API 문서',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '개발 서버',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

## 🔧 PM2 설정 (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'oneroom-manager',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    max_memory_restart: '1G',
    restart_delay: 4000,
  }],
};
```

## 📞 지원 및 문의

### 개발자 연락처
- 이메일: [developer-email]
- 전화: [developer-phone]
- 이슈 트래커: [GitHub Issues URL]
