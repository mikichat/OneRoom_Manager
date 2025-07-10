const db = require('../models');
const sampleSeeder = require('../seeders/20250711_sample_data'); // 시더 파일 경로

exports.runSeed = async (req, res) => {
  try {
    // 실제 환경에서는 이 엔드포인트를 보안해야 합니다.
    // 예: 관리자 역할 확인 또는 개발 환경에서만 허용
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: '샘플 데이터는 개발 환경에서만 실행할 수 있습니다.' });
    }

    const queryInterface = db.sequelize.getQueryInterface();
    await sampleSeeder.up(queryInterface, db.Sequelize);

    res.status(200).json({ message: '샘플 데이터가 성공적으로 시딩되었습니다!' });
  } catch (error) {
    console.error('시드 실행 중 오류 발생:', error);
    res.status(500).json({ message: '샘플 데이터 시딩에 실패했습니다.', error: error.message });
  }
};
