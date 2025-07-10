'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contracts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'rooms', key: 'id' }
      },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' }
      },
      contract_start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      contract_end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      monthly_rent: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      deposit: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contract_image_path: {
        type: Sequelize.TEXT
      },
      contract_status: {
        type: Sequelize.ENUM('활성', '만료', '해지'),
        defaultValue: '활성'
      },
      special_terms: {
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
    await queryInterface.dropTable('contracts');
  }
};