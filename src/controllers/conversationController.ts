import { Request, Response } from "express";
import { Conversation, ConversationMember, User } from "../db/models";
import { Op, Sequelize } from "sequelize";
import { resHelper } from "../utils";

const getConversationByMember = async (req: Request, res: Response) => {
  try {
    const userIds = (Array.isArray(req.query.userIds) ? req.query.userIds : [req.query.userIds]).map(Number);
    if (!Array.isArray(userIds) || userIds.some(isNaN) || userIds.length < 2)
      return res.status(400).send(resHelper.error(400, "Bad Request", "Invalid user list"));
    const conversation = await Conversation.findOne({
      attributes: ["id", "name", "createdBy", "isGroup"],
      include: [{ model: ConversationMember, attributes: ["id", "userId", "joinedAt"], as: "conversationMembers" }],
      where: Sequelize.literal(`
        EXISTS (
          SELECT 1 FROM "ConversationMembers" cm
          WHERE cm."conversationId" = "Conversation"."id"
          AND cm."userId" IN (${userIds.join(",")})
          GROUP BY cm."conversationId"
          HAVING COUNT(cm."userId") = ${userIds.length}
        )
      `),
    });
    return res.status(200).send(resHelper.success(200, "Ok", conversation));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).send(resHelper.error(500, "Internal Server Error", message));
  }
};

const createConversation = async (req: Request, res: Response) => {
  try {
    const { userIds, isGroup, createdBy, name } = req.body;
    if (!Array.isArray(userIds) || userIds.length < 2)
      return res.status(400).send(resHelper.error(400, "Bad Request", "Invalid user list"));
    const existingConversation = await Conversation.findOne({
      include: [
        {
          model: ConversationMember,
          where: { userId: userIds },
          attributes: ["id", "userId", "joinedAt"],
          as: "conversationMembers",
        },
      ],
      attributes: ["id", "name", "createdBy", "isGroup"],
      group: ["Conversation.id", "Conversation.name", "Conversation.createdBy", "Conversation.isGroup"],
      having: Sequelize.literal(
        `(SELECT COUNT(DISTINCT userId) FROM "ConversationMembers" WHERE "ConversationMembers"."conversationId" = "Conversation"."id") = ${userIds.length}`
      ),
    });

    if (existingConversation)
      return res.status(409).send(resHelper.error(409, "Conflict", "Conversation already exists"));
    const newConversation = await Conversation.create({ isGroup, createdBy, name });
    await Promise.all(
      userIds.map((userId) => ConversationMember.create({ conversationId: newConversation.id, userId }))
    );

    return res.status(201).send(resHelper.success(201, "Ok", newConversation));
  } catch (error) {
    console.log(error);

    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).send(resHelper.error(500, "Internal Server Error", message));
  }
};

// Get all conversations
const getAllConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await Conversation.findAll();
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve conversations" });
  }
};

const getAllConversationsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const conversations = await Conversation.findAll({
      include: [
        {
          model: ConversationMember,
          as: "conversationMembers",
          where: { userId },
          attributes: ["id", "userId", "joinedAt"],
          include: [{ model: User, as: "user", attributes: ["id", "displayName", "email", "avatar"] }],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "displayName", "email", "avatar"],
          required: false,
        },
      ],
      attributes: [
        "id",
        "createdBy",
        "isGroup",
        "createdAt",
        "name",
        [
          Sequelize.literal(`
            CASE 
              WHEN "Conversation"."isGroup" = 1 THEN "Conversation"."name"
              ELSE (
                SELECT "Users"."displayName"
                FROM "ConversationMembers" AS cm
                JOIN "Users" ON "Users"."id" = cm."userId"
                WHERE cm."conversationId" = "Conversation"."id"
                AND cm."userId" <> ${userId}
            )
            END
          `),
          "name",
        ],
      ],
    });

    return res.status(201).send(resHelper.success(200, "Ok", conversations));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to retrieve conversations" });
  }
};

// Get a single conversation by ID
const getConversationById = async (req: Request, res: Response) => {
  try {
    if (!req.params.id || isNaN(Number(req.params.id)))
      return res.status(400).send(resHelper.error(400, "Bad Request", "Invalid id"));
    const id = res.locals.id;
    const conversation = await Conversation.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: ConversationMember,
          as: "conversationMembers",
          attributes: ["id", "userId", "joinedAt"],
          where: { conversationId: req.params.id },
          include: [{ model: User, as: "user", attributes: ["displayName", "avatar", "firstName", "lastName"] }],
        },
      ],
      attributes: [
        "id",
        "createdBy",
        "isGroup",
        "createdAt",
        "name",
        [
          Sequelize.literal(`
            CASE 
              WHEN "Conversation"."isGroup" = 1 THEN "Conversation"."name"
              ELSE (
                SELECT "Users"."displayName"
                FROM "ConversationMembers" AS cm
                JOIN "Users" ON "Users"."id" = cm."userId"
                WHERE cm."conversationId" = "Conversation"."id"
                AND cm."userId" <> ${id}
            )
            END
          `),
          "name",
        ],
      ],
    });

    if (conversation) {
      res.status(200).json(conversation);
    } else {
      res.status(404).json({ error: "Conversation not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve conversation" });
  }
};

// Update a conversation by ID
const updateConversation = async (req: Request, res: Response) => {
  try {
    const [updated] = await Conversation.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedConversation = await Conversation.findByPk(req.params.id);
      res.status(200).json(updatedConversation);
    } else {
      res.status(404).json({ error: "Conversation not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update conversation" });
  }
};

// Delete a conversation by ID
const deleteConversation = async (req: Request, res: Response) => {
  try {
    const deleted = await Conversation.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Conversation not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete conversation" });
  }
};

export default {
  getConversationByMember,
  getAllConversations,
  getConversationById,
  updateConversation,
  deleteConversation,
  getAllConversationsByUserId,
  createConversation,
};
