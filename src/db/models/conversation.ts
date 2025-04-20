import { DataTypes, Model, Optional } from "sequelize";
import connection from "../../config/dbConnect";

export interface IConversation {
  id: number;
  name: string;
  isGroup: boolean;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConversationInput extends Optional<IConversation, "id"> {}
export interface ConversationOutput extends Required<IConversation> {}

class Conversation extends Model<IConversation, ConversationInput> implements IConversation {
  public id!: number;
  public name!: string;
  public isGroup!: boolean;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Conversation.init(
  {
    id: { primaryKey: true, autoIncrement: true, allowNull: false, type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING },
    isGroup: { allowNull: false, type: DataTypes.BOOLEAN, defaultValue: false },
    createdBy: { type: DataTypes.INTEGER },
  },
  { timestamps: true, sequelize: connection, underscored: false }
);

export default Conversation;
