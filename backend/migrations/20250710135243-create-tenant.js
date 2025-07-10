'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tenants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(100)
      },
      birth_first_six: {
        type: Sequelize.STRING(6)
      },
      emergency_contact: {
        type: Sequelize.STRING(20)
      },
      emergency_name: {
        type: Sequelize.STRING(50)
      },
      is_student: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      school_name: {
        type: Sequelize.STRING(100)
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
    await queryInterface.dropTable('tenants');
  }
};