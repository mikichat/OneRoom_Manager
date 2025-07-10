const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seedController');

// 샘플 데이터 시딩을 위한 라우트
// 실제 환경에서는 이 라우트를 보호해야 합니다 (예: 관리자 미들웨어 추가)
router.post('/seed-data', seedController.runSeed);

module.exports = router;
