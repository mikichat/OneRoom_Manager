'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rent_payments', {
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
      payment_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      payment_method: {
        type: Sequelize.ENUM('현금', '계좌이체', '카드'),
        defaultValue: '계좌이체'
      },
      payment_status: {
        type: Sequelize.ENUM('완료', '미납', '연체'),
        defaultValue: '미납'
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      memo: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rent_payments');
  }
};