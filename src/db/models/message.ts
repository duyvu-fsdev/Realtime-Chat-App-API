import { DataTypes, Model, Optional } from "sequelize";
import connection from "../../config/dbConnect";

export interface IMessage {
  id: number;
  conversationId: number;
  senderId: number;
  replyMessageId?: number;
  status: string;
  content?: string;
  type: string;
  readBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MessageInput extends Optional<IMessage, "id"> {}
export interface MessageOutput extends Required<IMessage> {}

class Message extends Model<IMessage, MessageInput> implements IMessage {
  public id!: number;
  public conversationId!: number;
  public senderId!: number;
  public replyMessageId!: number;
  public content!: string;
  public type!: string;
  public status!: string;
  public readBy!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: { primaryKey: true, autoIncrement: true, allowNull: false, type: DataTypes.INTEGER },
    conversationId: { allowNull: false, type: DataTypes.INTEGER },
    senderId: { allowNull: false, type: DataTypes.INTEGER },
    replyMessageId: { type: DataTypes.INTEGER },
    content: { type: DataTypes.TEXT },
    status: { allowNull: false, type: DataTypes.STRING },
    type: { allowNull: false, type: DataTypes.STRING, defaultValue: "text" },
    readBy: { allowNull: false, type: DataTypes.TEXT },
  },
  { timestamps: true, sequelize: connection, underscored: false }
);

export default Message;
