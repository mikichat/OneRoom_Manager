const { User } = require('../models');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.create({ username, password, role: 'user' }); // role 추가
    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      console.log('User not found for username:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user.username);
    console.log('Input password:', password); // 실제 환경에서는 로깅하지 마세요!
    console.log('Stored hashed password:', user.password);

    const isMatch = user.isValidPassword(password);

    console.log('Password match result (isMatch):', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Logged in successfully', token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
