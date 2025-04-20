import { DataTypes, Model, Optional } from "sequelize";
import connection from "../../config/dbConnect";

export interface IConnection {
  id: number;
  userId: number;
  targetId: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface ConnectionInput extends Optional<IConnection, "id"> {}
export interface ConnectionOutput extends Required<IConnection> {}

class Connection extends Model<IConnection, ConnectionInput> implements IConnection {
  public id!: number;
  public userId!: number;
  public targetId!: number;
  public status!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Connection.init(
  {
    id: { primaryKey: true, autoIncrement: true, allowNull: false, type: DataTypes.INTEGER },
    userId: { allowNull: false, type: DataTypes.INTEGER },
    targetId: { allowNull: false, type: DataTypes.INTEGER },
    status: { allowNull: false, type: DataTypes.STRING },
  },
  { timestamps: true, sequelize: connection, underscored: false }
);

export default Connection;
