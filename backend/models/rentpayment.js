'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RentPayment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RentPayment.belongsTo(models.Contract, {
        foreignKey: 'contract_id',
        as: 'contract'
      });
    }
  }
  RentPayment.init({
    contract_id: DataTypes.INTEGER,
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    payment_method: {
      type: DataTypes.ENUM('현금', '계좌이체', '카드'),
      defaultValue: '계좌이체'
    },
    payment_status: {
      type: DataTypes.ENUM('완료', '미납', '연체'),
      defaultValue: '미납'
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    memo: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'RentPayment',
    timestamps: true,
    underscored: true
  });
  return RentPayment;
};