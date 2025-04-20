import { DataTypes, Model, Optional } from "sequelize";
import connection from "../../config/dbConnect";

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string;
  gender: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  avatar?: string;
  isOnline?: boolean;
  lastOnline?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface UserInput extends Optional<IUser, "id"> {}
export interface UserOutput extends Required<IUser> {}

class User extends Model<IUser, UserInput> implements IUser {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public displayName!: string;
  public gender!: string;
  public email!: string;
  public password!: string;
  public role!: string;
  public isActive!: boolean;
  public isVerified!: boolean;
  public avatar!: string;
  public isOnline!: boolean;
  public lastOnline!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: { primaryKey: true, autoIncrement: true, allowNull: false, type: DataTypes.INTEGER },
    firstName: { allowNull: false, type: DataTypes.STRING },
    lastName: { allowNull: false, type: DataTypes.STRING },
    displayName: { allowNull: false, type: DataTypes.STRING },
    email: { allowNull: false, type: DataTypes.STRING },
    gender: { allowNull: false, type: DataTypes.STRING },
    password: { allowNull: false, type: DataTypes.STRING },
    role: { allowNull: false, type: DataTypes.STRING },
    isActive: { allowNull: false, type: DataTypes.BOOLEAN },
    isVerified: { allowNull: false, type: DataTypes.BOOLEAN },
    avatar: { type: DataTypes.STRING },
    isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
    lastOnline: { type: DataTypes.DATE },
  },
  { timestamps: true, sequelize: connection, underscored: false }
);

export default User;
