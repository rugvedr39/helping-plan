import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { EPin } from "./epin.model";

interface TransferHistoryAttributes {
  id: number;
  ePinId: number;
  transferredById: number;
  transferredToId: number;
  transferredAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TransferHistoryCreationAttributes
  extends Optional<TransferHistoryAttributes, "id" | "createdAt" | "updatedAt"> {}

class TransferHistory extends Model<TransferHistoryAttributes, TransferHistoryCreationAttributes> implements TransferHistoryAttributes {
  public id!: number;
  public ePinId!: number;
  public transferredById!: number;
  public transferredToId!: number;
  public transferredAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TransferHistory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ePinId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: EPin,
        key: "id",
      },
    },
    transferredById: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    transferredToId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    transferredAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "TransferHistory",
    tableName: "transfer_histories",
  }
);

User.hasMany(TransferHistory, { foreignKey: "transferredById", as: "TransfersMade" });
User.hasMany(TransferHistory, { foreignKey: "transferredToId", as: "TransfersReceived" });
EPin.hasMany(TransferHistory, { foreignKey: "ePinId" });

TransferHistory.belongsTo(User, { as: "transferredBy", foreignKey: "transferredById" });
TransferHistory.belongsTo(User, { as: "transferredTo", foreignKey: "transferredToId" });
TransferHistory.belongsTo(EPin, { foreignKey: "ePinId" });



export { TransferHistory };
