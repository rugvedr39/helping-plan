import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

class Admin extends Model {}

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
        whatsappGroupUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: '',
      validate: {
        isUrl: true
      }
    },
    zoomMeetingTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Weekly Zoom Meeting'
    },
    zoomMeetingTime: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Every Saturday at 7:00 PM IST'
    },
    zoomMeetingUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: '',
      validate: {
        isUrl: true
      }
    }
  },
  {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins',
  }
);

export { Admin };