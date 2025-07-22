require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors'); // cors 모듈 추가
const fs = require('fs'); // fs 모듈 추가
const app = express();
const port = process.env.PORT || 3000;
const morgan = require('morgan'); // morgan 모듈 추가

// 로그 디렉토리 생성
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// 로그 스트림 생성
const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });
const appLogStream = fs.createWriteStream(path.join(logDirectory, 'app.log'), { flags: 'a' });

const config = require('./config/config.json')[process.env.NODE_ENV || 'development']; // 설정 파일 로드

// 디버그 로깅 설정 확인
const isDebugLoggingEnabled = config.debugLogging || false;

// 커스텀 로거 함수
const debugLog = (...args) => {
  if (isDebugLoggingEnabled) {
    const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');
    const timestamp = new Date().toISOString();
    appLogStream.write(`[${timestamp}] [DEBUG] ${message}\n`);
    console.log('[DEBUG]', ...args); // 기존 콘솔 출력 유지
  }
};

if (isDebugLoggingEnabled) {
  // Morgan 토큰 정의: 요청 헤더 및 쿼리를 JSON 문자열로 반환
  morgan.token('req-headers', (req, res) => JSON.stringify(req.headers));
  morgan.token('req-query', (req, res) => JSON.stringify(req.query));
  
  // 새로운 포맷 정의
  const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" \nQuery: :req-query \nHeaders: :req-headers';

  app.use(morgan(morganFormat, { stream: accessLogStream })); // 파일에 자세한 로그 저장
  app.use(morgan('dev')); // 콘솔에는 기존처럼 표시
}

const authRoutes = require('./routes/authRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const roomRoutes = require('./routes/roomRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const contractRoutes = require('./routes/contractRoutes');
const rentPaymentRoutes = require('./routes/rentPaymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const roomOptionRoutes = require('./routes/roomOptionRoutes');
const seedRoutes = require('./routes/seedRoutes'); // 새로 추가

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors()); // CORS 미들웨어 추가
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Hello, OneRoom Manager!');
});

app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/rent-payments', rentPaymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/room-options', roomOptionRoutes);
app.use('/api', seedRoutes); // 새로 추가

const setupCronJobs = require('./cronJobs');

app.listen(port, () => {
  debugLog(`Server is running on port ${port} (Debug Logging: ${isDebugLoggingEnabled ? 'ON' : 'OFF'})`); // 커스텀 로거 사용
  setupCronJobs();
});
