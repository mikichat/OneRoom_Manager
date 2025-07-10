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
      // define association here
    }
  }
  Contract.init({
    room_id: DataTypes.INTEGER,
    tenant_id: DataTypes.INTEGER,
    contract_start_date: DataTypes.DATE,
    contract_end_date: DataTypes.DATE,
    monthly_rent: DataTypes.INTEGER,
    deposit: DataTypes.INTEGER,
    contract_image_path: DataTypes.TEXT,
    contract_status: DataTypes.ENUM,
    special_terms: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Contract',
  });
  return Contract;
};