'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Notification.init({
    contract_id: DataTypes.INTEGER,
    type: DataTypes.ENUM,
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    sent_at: DataTypes.DATE,
    status: DataTypes.ENUM
  }, {
    sequelize,
    modelName: 'Notification',
  });
  return Notification;
};