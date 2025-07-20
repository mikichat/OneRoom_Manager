'use strict';
const {
  Model
} = require('sequelize');
const { encrypt, decrypt } = require('../utils/cryptoUtils'); // cryptoUtils import

module.exports = (sequelize, DataTypes) => {
  class Tenant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Tenant.hasMany(models.Contract, {
        foreignKey: 'tenant_id',
        as: 'contracts'
      });
      // define association here
    }
  }
  Tenant.init({
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      set(value) {
        this.setDataValue('name', encrypt(value));
      },
      get() {
        return decrypt(this.getDataValue('name'));
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue('phone', encrypt(value));
      },
      get() {
        return decrypt(this.getDataValue('phone'));
      }
    },
    email: {
      type: DataTypes.STRING(100),
      set(value) {
        this.setDataValue('email', encrypt(value));
      },
      get() {
        return decrypt(this.getDataValue('email'));
      }
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
    timestamps: true, // createdAt 및 updatedAt 자동 관리를 위해 추가
    underscored: true // created_at 및 updated_at 컬럼 매핑을 위해 추가
  });
  return Tenant;
};