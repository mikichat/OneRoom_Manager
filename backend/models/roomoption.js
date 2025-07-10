'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoomOption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RoomOption.init({
    room_id: DataTypes.INTEGER,
    refrigerator: DataTypes.BOOLEAN,
    washing_machine: DataTypes.BOOLEAN,
    air_conditioner: DataTypes.BOOLEAN,
    induction: DataTypes.BOOLEAN,
    microwave: DataTypes.BOOLEAN,
    tv: DataTypes.BOOLEAN,
    wifi_router: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'RoomOption',
  });
  return RoomOption;
};