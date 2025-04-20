import { DataTypes, Model, Optional } from "sequelize";
import connection from "../../config/dbConnect";

export interface IAttachment {
  id: number;
  messageId: number;
  url: string;
  type: string;
  size: number;
  originalname: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttachmentInput extends Optional<IAttachment, "id"> {}
export interface AttachmentOutput extends Required<IAttachment> {}

class Attachment extends Model<IAttachment, AttachmentInput> implements IAttachment {
  public id!: number;
  public messageId!: number;
  public url!: string;
  public type!: string;
  public size!: number;
  public originalname!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Attachment.init(
  {
    id: { primaryKey: true, autoIncrement: true, allowNull: false, type: DataTypes.INTEGER },
    messageId: { allowNull: false, type: DataTypes.INTEGER },
    url: { allowNull: false, type: DataTypes.STRING },
    type: { allowNull: false, type: DataTypes.STRING },
    size: { allowNull: false, type: DataTypes.INTEGER },
    originalname: { allowNull: false, type: DataTypes.STRING },
  },
  { timestamps: true, sequelize: connection, underscored: false }
);

export default Attachment;
