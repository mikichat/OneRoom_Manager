'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tenant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Tenant.init({
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    birth_first_six: DataTypes.STRING,
    emergency_contact: DataTypes.STRING,
    emergency_name: DataTypes.STRING,
    is_student: DataTypes.BOOLEAN,
    school_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tenant',
  });
  return Tenant;
};