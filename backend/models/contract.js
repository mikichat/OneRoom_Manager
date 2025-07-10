'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contract extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Contract.belongsTo(models.Room, {
        foreignKey: 'room_id',
        as: 'room'
      });
      Contract.belongsTo(models.Tenant, {
        foreignKey: 'tenant_id',
        as: 'tenant'
      });
      Contract.hasMany(models.RentPayment, {
        foreignKey: 'contract_id',
        as: 'rent_payments'
      });
      Contract.hasMany(models.Notification, {
        foreignKey: 'contract_id',
        as: 'notifications'
      });
    }
  }
  Contract.init({
    room_id: DataTypes.INTEGER,
    tenant_id: DataTypes.INTEGER,
    contract_start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    contract_end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    monthly_rent: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deposit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    contract_image_path: DataTypes.TEXT,
    contract_status: {
      type: DataTypes.ENUM('활성', '만료', '해지'),
      defaultValue: '활성'
    },
    special_terms: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Contract',
  });
  return Contract;
};