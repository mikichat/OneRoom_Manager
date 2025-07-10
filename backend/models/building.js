'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Building extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Building.hasMany(models.Room, {
        foreignKey: 'building_id',
        as: 'rooms'
      });
    }
  }
  Building.init({
    name: DataTypes.STRING,
    address: DataTypes.TEXT,
    total_floors: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Building',
  });
  return Building;
};