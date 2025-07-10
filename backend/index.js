require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const authRoutes = require('./routes/authRoutes');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, OneRoom Manager!');
});

app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
