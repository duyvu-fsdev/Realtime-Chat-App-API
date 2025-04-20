import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { ConversationMember, Message } from "../db/models";
import { resHelper } from "../utils";

const getAttachmentByMsgId = async (req: Request, res: Response) => {
  try {
    const { msgId, cvsId, filename } = req.params;

    if (isNaN(Number(msgId)) || isNaN(Number(cvsId))) {
      return res.status(400).send(resHelper.error(400, "Bad Request", "Invalid messageId or conversationId"));
    }

    const userId = res.locals.id;
    const message = await Message.findByPk(Number(msgId));
    if (!message) return res.status(404).send(resHelper.error(404, "Not Found", "Message not found"));
    const isMember = (await ConversationMember.count({ where: { userId, conversationId: cvsId } })) > 0;
    if (!isMember) return res.status(403).send(resHelper.error(403, "Forbidden", "Access denied"));
    const filePath = path.join(__dirname, "../../uploads", filename);
    if (!fs.existsSync(filePath)) return res.status(404).send(resHelper.error(404, "Not Found", "File not found"));
    return res.sendFile(filePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).send(resHelper.error(500, "Internal Server Error", message));
  }
};

export default { getAttachmentByMsgId };
