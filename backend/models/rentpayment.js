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
      // define association here
    }
  }
  RentPayment.init({
    contract_id: DataTypes.INTEGER,
    payment_date: DataTypes.DATE,
    amount: DataTypes.INTEGER,
    payment_method: DataTypes.ENUM,
    payment_status: DataTypes.ENUM,
    due_date: DataTypes.DATE,
    memo: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'RentPayment',
  });
  return RentPayment;
};