import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { TransferHistory } from "./transferHistory.model"; // Import TransferHistory

interface EPinAttributes {
  id: number;
  code: string;
  status: "unused" | "used" | "transferred";
  usedById?: number | null;
  transferredById?: number | null;
  userId: number; 
  createdAt?: Date;
  updatedAt?: Date;
}

interface EPinCreationAttributes
  extends Optional<EPinAttributes, "id" | "usedById" | "transferredById" | "createdAt" | "updatedAt"> {}

class EPin extends Model<EPinAttributes, EPinCreationAttributes> implements EPinAttributes {
  public id!: number;
  public code!: string;
  public status!: "unused" | "used" | "transferred";
  public usedById!: number | null;
  public transferredById!: number | null;
  public userId!: number; 
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EPin.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("unused", "used", "transferred"),
      allowNull: false,
      defaultValue: "unused",
    },
    usedById: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    transferredById: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "EPin",
    tableName: "epins",
  }
);

// User.hasMany(EPin, { foreignKey: "userId" });
// EPin.belongsTo(User, { as: "user", foreignKey: "userId" });

// User.hasMany(EPin, { foreignKey: "usedById" });
// EPin.belongsTo(User, { as: "usedBy", foreignKey: "usedById" });

// User.hasMany(EPin, { foreignKey: "transferredById" });
// EPin.belongsTo(User, { as: "transferredBy", foreignKey: "transferredById" });

// EPin.hasMany(TransferHistory, { foreignKey: "ePinId" });

const checkEpinValidity = async (epinCode: string): Promise<boolean> => {
  const epin = await EPin.findOne({ where: { code: epinCode, status: ["unused", "transferred"] } });
  return epin ? true : false;
};
const useEpin = async (epinCode: string, userId: number): Promise<void> => {
  const epin = await EPin.findOne({ where: { code: epinCode, status: ["unused", "transferred"] } });
  if (epin) {
    await epin.update({ status: "used", usedById: userId });
  } else {
    throw new Error("Invalid epin or epin cannot be used.");
  }
};
export { EPin,checkEpinValidity,useEpin };
