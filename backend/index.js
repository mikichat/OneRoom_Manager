require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors'); // cors 모듈 추가
const app = express();
const port = process.env.PORT || 3000;
const morgan = require('morgan'); // morgan 모듈 추가
const config = require('./config/config.json')[process.env.NODE_ENV || 'development']; // 설정 파일 로드

// 디버그 로깅 설정 확인
const isDebugLoggingEnabled = config.debugLogging || false;

// 커스텀 로거 함수
const debugLog = (...args) => {
  if (isDebugLoggingEnabled) {
    console.log('[DEBUG]', ...args);
  }
};

if (isDebugLoggingEnabled) {
  app.use(morgan('dev')); // 개발 환경에서만 HTTP 요청 로깅
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
