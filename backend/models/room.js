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
      // define association here
    }
  }
  Room.init({
    building_id: DataTypes.INTEGER,
    room_number: DataTypes.STRING,
    floor: DataTypes.INTEGER,
    room_type: DataTypes.ENUM,
    area: DataTypes.DECIMAL,
    monthly_rent: DataTypes.INTEGER,
    deposit: DataTypes.INTEGER,
    status: DataTypes.ENUM,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Room',
  });
  return Room;
};