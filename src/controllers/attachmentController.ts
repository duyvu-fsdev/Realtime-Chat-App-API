import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { ConversationMember, Message } from "../db/models";
import { resHelper } from "../utils";

const accessFile = async (req: Request, res: Response) => {
  try {
    const { msgId, cvsId, type, filename } = req.params;
    const userId = res.locals.id;
    const msgIdNum = Number(msgId);
    const cvsIdNum = Number(cvsId);
    if (isNaN(msgIdNum) || isNaN(cvsIdNum) || !type || !filename)
      return res.status(400).send(resHelper.error(400, "Bad Request", "Invalid messageId or conversationId"));
    const message = await Message.findByPk(msgIdNum);
    if (!message) return res.status(404).send(resHelper.error(404, "Not Found", "Message not found"));
    const isMember = await ConversationMember.count({ where: { userId, conversationId: cvsIdNum } });
    if (isMember === 0) return res.status(403).send(resHelper.error(403, "Forbidden", "Access denied"));
    const f = type === "image" ? "images" : type === "video" ? "videos" : "documents";
    const filePath = path.resolve(__dirname, `../../uploads/${f}`, filename);
    if (!fs.existsSync(filePath)) return res.status(404).send(resHelper.error(404, "Not Found", "File not found"));
    return res.sendFile(filePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).send(resHelper.error(500, "Internal Server Error", message));
  }
};

export default { accessFile };
