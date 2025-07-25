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
      RoomOption.belongsTo(models.Room, {
        foreignKey: 'room_id',
        as: 'room'
      });
    }
  }
  RoomOption.init({
    room_id: DataTypes.INTEGER,
    refrigerator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    washing_machine: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    air_conditioner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    induction: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    microwave: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    tv: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    wifi_router: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'RoomOption',
    timestamps: true, // createdAt 및 updatedAt 자동 관리를 위해 추가
    underscored: true // created_at 및 updated_at 컬럼 매핑을 위해 추가
  });
  return RoomOption;
};