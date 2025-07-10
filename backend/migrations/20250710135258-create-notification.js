'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      contract_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'contracts', key: 'id' }
      },
      type: {
        type: Sequelize.ENUM('SMS', '카카오톡', '이메일'),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      sent_at: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.ENUM('대기', '발송완료', '실패'),
        defaultValue: '대기'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
  }
};