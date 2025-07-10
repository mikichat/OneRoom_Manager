'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Room.belongsTo(models.Building, {
        foreignKey: 'building_id',
        as: 'building'
      });
      Room.hasOne(models.RoomOption, {
        foreignKey: 'room_id',
        as: 'room_option'
      });
    }
  }
  Room.init({
    building_id: DataTypes.INTEGER,
    room_number: DataTypes.STRING(20),
    floor: DataTypes.INTEGER,
    room_type: {
      type: DataTypes.ENUM('1룸', '2룸'),
      allowNull: false
    },
    area: DataTypes.DECIMAL(5, 2),
    monthly_rent: DataTypes.INTEGER,
    deposit: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM('임대가능', '임대중', '수리중'),
      defaultValue: '임대가능'
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Room',
  });
  return Room;
};