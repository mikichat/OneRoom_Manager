require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
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

app.use(express.json());
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
  console.log(`Server is running on port ${port}`);
  setupCronJobs();
});
