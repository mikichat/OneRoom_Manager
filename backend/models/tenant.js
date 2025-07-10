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
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(100)
    },
    birth_first_six: {
      type: DataTypes.STRING(6)
    },
    emergency_contact: {
      type: DataTypes.STRING(20)
    },
    emergency_name: {
      type: DataTypes.STRING(50)
    },
    is_student: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    school_name: {
      type: DataTypes.STRING(100)
    }
  }, {
    sequelize,
    modelName: 'Tenant',
  });
  return Tenant;
};