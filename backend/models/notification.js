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
      Notification.belongsTo(models.Contract, {
        foreignKey: 'contract_id',
        as: 'contract'
      });
    }
  }
  Notification.init({
    contract_id: DataTypes.INTEGER,
    type: {
      type: DataTypes.ENUM('SMS', '카카오톡', '이메일'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    sent_at: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('대기', '발송완료', '실패'),
      defaultValue: '대기'
    }
  }, {
    sequelize,
    modelName: 'Notification',
    timestamps: true,
    underscored: true
  });
  return Notification;
};