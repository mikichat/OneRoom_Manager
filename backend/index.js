require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
const morgan = require('morgan');
const winston = require('winston'); // winston import

// 로그 디렉토리 생성
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// winston 로거 설정
const logger = winston.createLogger({
  level: 'debug', // 모든 debug 레벨 로그를 기록
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // 콘솔에도 출력
    new winston.transports.File({ filename: path.join(logDirectory, 'app.log') }), // app.log 파일에 기록
  ],
});

logger.debug('Server starting...'); // 이 줄을 여기로 이동

// 커스텀 로거 함수를 winston 로거로 대체
const debugLog = (...args) => {
  const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');
  logger.debug(message);
};

global.debugLog = debugLog; // debugLog를 global 객체에 할당

const config = require('./config/config.json')[process.env.NODE_ENV || 'development'];

const isDebugLoggingEnabled = config.debugLogging || false;

if (isDebugLoggingEnabled) {
  morgan.token('req-headers', (req, res) => JSON.stringify(req.headers));
  morgan.token('req-query', (req, res) => JSON.stringify(req.query));
  
  const morganFormat = ':remote-addr - :remote-user [:date[clf]] \":method :url HTTP/:http-version\" :status :res[content-length] \":referrer\" \":user-agent\" \nQuery: :req-query \nHeaders: :req-headers';

  app.use(morgan(morganFormat, { stream: fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' }) }));
  app.use(morgan('dev'));
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
const seedRoutes = require('./routes/seedRoutes');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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
app.use('/api', seedRoutes);

const setupCronJobs = require('./cronJobs');

app.listen(port, () => {
  debugLog(`Server is running on port ${port} (Debug Logging: ${isDebugLoggingEnabled ? 'ON' : 'OFF'})`);
  setupCronJobs();
});