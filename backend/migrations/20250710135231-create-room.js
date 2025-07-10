'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rooms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      building_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'buildings', key: 'id' }
      },
      room_number: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      floor: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      room_type: {
        type: Sequelize.ENUM('1룸', '2룸'),
        allowNull: false
      },
      area: {
        type: Sequelize.DECIMAL(5,2)
      },
      monthly_rent: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      deposit: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('임대가능', '임대중', '수리중'),
        defaultValue: '임대가능'
      },
      description: {
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
    await queryInterface.dropTable('rooms');
  }
};