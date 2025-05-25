import { DataTypes, Model, Optional } from "sequelize";
import connection from "../../config/dbConnect";

export interface IRelationship {
  id: number;
  user1: number;
  user2: number;
  status: string;
  initiatorId: number;
  blockedBy?: number;
  user1IsFollowing?: boolean;
  user2IsFollowing?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface RelationshipInput extends Optional<IRelationship, "id"> {}
export interface RelationshipOutput extends Required<IRelationship> {}

class Relationship extends Model<IRelationship, RelationshipInput> implements IRelationship {
  public id!: number;
  public user1!: number;
  public user2!: number;
  public status!: string;
  public initiatorId!: number;
  public blockedBy?: number;
  public user1IsFollowing?: boolean;
  public user2IsFollowing?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Relationship.init(
  {
    id: { primaryKey: true, autoIncrement: true, allowNull: false, type: DataTypes.INTEGER },
    user1: { allowNull: false, type: DataTypes.INTEGER },
    user2: { allowNull: false, type: DataTypes.INTEGER },
    initiatorId: { allowNull: false, type: DataTypes.INTEGER },
    blockedBy: { allowNull: true, type: DataTypes.INTEGER },
    user1IsFollowing: { allowNull: true, type: DataTypes.BOOLEAN },
    user2IsFollowing: { allowNull: true, type: DataTypes.BOOLEAN },
    status: { allowNull: false, type: DataTypes.STRING },
  },
  { timestamps: true, sequelize: connection, underscored: false }
);

export default Relationship;
