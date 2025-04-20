import { DataTypes, Model, Optional } from "sequelize";
import connection from "../../config/dbConnect";

export interface IConversationMember {
  id: number;
  userId: number;
  conversationId: number;
  joinedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConversationMemberInput extends Optional<IConversationMember, "id"> {}
export interface ConversationMemberOutput extends Required<IConversationMember> {}

class ConversationMember extends Model<IConversationMember, ConversationMemberInput> implements IConversationMember {
  public id!: number;
  public userId!: number;
  public conversationId!: number;
  public joinedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConversationMember.init(
  {
    id: { primaryKey: true, autoIncrement: true, allowNull: false, type: DataTypes.INTEGER },
    userId: { allowNull: false, type: DataTypes.INTEGER },
    conversationId: { allowNull: false, type: DataTypes.INTEGER },
    joinedAt: { type: DataTypes.DATE },
  },
  { timestamps: true, sequelize: connection, underscored: false }
);

export default ConversationMember;
