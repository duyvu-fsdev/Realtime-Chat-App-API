import { Request, Response } from "express";
import { ConversationMember, Message, User, Attachment } from "../db/models";
import { getWebSocketServer } from "../sockets/websocket";
import { videoQueue, filesHelper, resHelper } from "../utils";

// export const createMessage = async (req: Request, res: Response) => {
//   try {
//     const { conversationId, senderId, replyMessageId, content } = req.body;
//     const files = req.files as Express.Multer.File[];
//     if (!conversationId || !senderId || !(content || files))
//       return res.status(400).send(resHelper.error(400, "Bad Request", "Missing required fields"));
//     const message = await Message.create({
//       conversationId,
//       senderId,
//       replyMessageId,
//       content: content || null,
//       readBy: JSON.stringify([senderId]),
//       status: "sent",
//     });

//     if (files && files.length) {
//       await Promise.all(
//         files.map((file) =>
//           Attachment.create({
//             messageId: message.id,
//             originalname: file.originalname,
//             url: filesHelper.buildMediaUrl(file.path, file.mimetype),
//             type: file.mimetype,
//           })
//         )
//       );
//     }

//     const fullMessage = await Message.findOne({
//       where: { id: message.id },
//       include: [
//         { model: User, as: "sender", attributes: ["id", "displayName", "avatar", "firstName", "lastName"] },
//         { model: Attachment, as: "attachments", attributes: ["id", "originalname", "url", "type"] },
//       ],
//     });

//     const members = await ConversationMember.findAll({ where: { conversationId }, attributes: ["userId"] });
//     const memberIds = members.map((m) => m.userId);
//     const wss = getWebSocketServer();
//     const senderSocketId = res.locals.senderSocketId;
//     if (wss)
//       wss.clients.forEach((client: any) => {
//         if (client.readyState === client.OPEN && memberIds.includes(client.userId))
//           client.send(
//             JSON.stringify({ type: "NEW_MESSAGE", data: fullMessage, fromSelf: client.socketId === senderSocketId })
//           );
//       });
//     return res.status(201).send(resHelper.success(201, "Message sent successfully", fullMessage));
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .send(resHelper.error(500, "Internal Server Error", error instanceof Error ? error.message : ""));
//   }
// };

const createMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, senderId, replyMessageId, content } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!conversationId || !senderId || !(content || files?.length))
      return res.status(400).send(resHelper.error(400, "Bad Request", "Missing required fields"));

    const processedFiles = await filesHelper.processFiles(files, Number(senderId));
    const createdMessages: Message[] = [];

    const images = processedFiles.filter((f) => f.mimetype.startsWith("image/"));
    const videos = processedFiles.filter((f) => f.mimetype.startsWith("video/"));
    const documents = processedFiles.filter((f) => f.mimetype.startsWith("application/"));

    if (images.length) {
      const imgMsg = await Message.create({
        conversationId,
        senderId,
        replyMessageId,
        readBy: JSON.stringify([senderId]),
        status: "sent",
        type: "image",
      });

      await Attachment.bulkCreate(
        images.map((file) => ({
          messageId: imgMsg.id,
          originalname: file.originalname,
          url: encodeURIComponent(file.filename),
          size: file.size,
          type: "image",
        }))
      );
      createdMessages.push(imgMsg);
    }

    for (const file of videos) {
      const videoMsg = await Message.create({
        conversationId,
        senderId,
        replyMessageId,
        readBy: JSON.stringify([senderId]),
        status: "sent",
        type: "video",
      });

      const attachment = await Attachment.create({
        messageId: videoMsg.id,
        originalname: file.originalname,
        url: encodeURIComponent(file.filename),
        size: file.size,
        type: "video",
      });
      try {
        await videoQueue.addToQueue({
          originalPath: file.path,
          attachmentId: attachment.id,
          userId: senderId,
        });
      } catch (err) {
        console.error("Queue add error:", err);
      }

      createdMessages.push(videoMsg);
    }

    for (const file of documents) {
      const docMsg = await Message.create({
        conversationId,
        senderId,
        replyMessageId,
        readBy: JSON.stringify([senderId]),
        status: "sent",
        type: "document",
      });
      await Attachment.create({
        messageId: docMsg.id,
        originalname: file.originalname,
        url: encodeURIComponent(file.filename),
        type: "document",
        size: file.size,
      });
      createdMessages.push(docMsg);
    }

    if (content) {
      const textMsg = await Message.create({
        conversationId,
        senderId,
        replyMessageId,
        content,
        readBy: JSON.stringify([senderId]),
        status: "sent",
        type: "text",
      });
      createdMessages.push(textMsg);
    }

    const createdMessageIds = createdMessages.map((m) => m.id);
    const fullMessagesRaw = await Message.findAll({
      where: { id: createdMessageIds },
      include: [
        { model: User, as: "sender", attributes: ["id", "displayName", "avatar", "firstName", "lastName"] },
        { model: Attachment, as: "attachments", attributes: ["id", "originalname", "url", "type", "size"] },
        {
          model: Message,
          as: "replyMessage",
          include: [
            { model: User, as: "sender", attributes: ["id", "displayName", "avatar", "firstName", "lastName"] },
            { model: Attachment, as: "attachments", attributes: ["id", "originalname", "url", "type", "size"] },
          ],
        },
      ],
    });

    const fullMessages = createdMessageIds.map((id) => fullMessagesRaw.find((msg) => msg.id === id));

    const members = await ConversationMember.findAll({ where: { conversationId }, attributes: ["userId"] });
    const memberIds = members.map((m) => m.userId);
    const wss = getWebSocketServer();
    const senderSocketId = res.locals.senderSocketId;

    if (wss) {
      wss.clients.forEach((client: any) => {
        if (client.readyState === client.OPEN && memberIds.includes(client.userId)) {
          fullMessages.forEach((msg) => {
            if (msg)
              client.send(
                JSON.stringify({ type: "NEW_MESSAGE", data: msg, fromSelf: client.socketId === senderSocketId })
              );
          });
        }
      });
    }

    return res.status(201).send(resHelper.success(201, "Messages sent successfully", fullMessages));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(resHelper.error(500, "Internal Server Error", error instanceof Error ? error.message : ""));
  }
};

const getMessagesByConversationId = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const limit = req.query.limit !== "undefined" ? Number(req.query.limit) : 30;
    if (!conversationId) return res.status(400).send(resHelper.error(400, "Bad Request", "Missing conversationId"));

    const messages = await Message.findAll({
      where: { conversationId },
      include: [
        { model: User, as: "sender", attributes: ["id", "displayName", "avatar", "firstName", "lastName"] },
        { model: Attachment, as: "attachments", attributes: ["id", "originalname", "url", "type"] },
        {
          model: Message,
          as: "replyMessage",
          include: [
            { model: User, as: "sender", attributes: ["id", "displayName", "avatar", "firstName", "lastName"] },
            { model: Attachment, as: "attachments", attributes: ["id", "originalname", "url", "type", "size"] },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset: offset,
      limit: limit,
    });
    messages.reverse();

    return res.status(200).send(resHelper.success(200, "Messages retrieved successfully", messages));
  } catch (error) {
    return res
      .status(500)
      .send(resHelper.error(500, "Internal Server Error", error instanceof Error ? error.message : ""));
  }
};

const updateMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!messageId || !content) {
      return res.status(400).send(resHelper.error(400, "Bad Request", "Missing required fields"));
    }

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).send(resHelper.error(404, "Not Found", "Message not found"));
    }

    message.content = content;
    await message.save();

    return res.status(200).send(resHelper.success(200, "Message updated successfully", message));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(resHelper.error(500, "Internal Server Error", error instanceof Error ? error.message : ""));
  }
};

const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).send(resHelper.error(400, "Bad Request", "Missing messageId"));
    }

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).send(resHelper.error(404, "Not Found", "Message not found"));
    }

    await message.destroy();

    return res.status(200).send(resHelper.success(200, "Message deleted successfully"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(resHelper.error(500, "Internal Server Error", error instanceof Error ? error.message : ""));
  }
};

export default { createMessage, getMessagesByConversationId, updateMessage, deleteMessage };
