'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('room_options', {
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
      refrigerator: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      washing_machine: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      air_conditioner: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      induction: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      microwave: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      tv: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      wifi_router: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('room_options');
  }
};