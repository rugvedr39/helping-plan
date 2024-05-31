import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface AdminAttributes {
  id: number;
  username: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AdminCreationAttributes extends Optional<AdminAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Admin extends Model<AdminAttributes, AdminCreationAttributes> implements AdminAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

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
  },
  {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins',
  }
);

export { Admin };