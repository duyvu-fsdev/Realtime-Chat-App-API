// import { Request, Response } from "express";
// import { Op, Sequelize } from "sequelize";
// import {  User } from "../db/models";
// import { resHelper } from "../utils";

// const sendFriendRequest = async (req: Request, res: Response) => {
//   try {
//     const { userId, targetId } = req.body;
//     if (userId === targetId) return res.status(400).json({ error: "Không thể gửi kết bạn cho chính mình" });
//     const existingConnection = await Connection.findOne({ where: { userId, targetId } });
//     if (existingConnection) return res.status(400).json({ error: "Yêu cầu đã tồn tại" });
//     const newConnection = await Connection.create({ userId, targetId, status: "pending" });
//     res.status(201).json(newConnection);
//   } catch (error) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return res.status(500).send(resHelper.error(500, "Internal Server Error", message));
//   }
// };

// const acceptFriendRequest = async (req: Request, res: Response) => {
//   try {
//     const { userId, targetId } = req.body;

//     const connection = await Connection.findOne({
//       where: { targetId, userId, status: "pending" },
//     });

//     if (!connection) {
//       return res.status(404).json({ error: "Không tìm thấy lời mời kết bạn" });
//     }

//     await connection.update({ status: "accepted" });

//     res.status(200).json({ message: "Đã chấp nhận lời mời kết bạn" });
//   } catch (error) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return res.status(500).send(resHelper.error(500, "Internal Server Error", message));
//   }
// };

// const cancelFriendRequest = async (req: Request, res: Response) => {
//   try {
//     const { userId, targetId } = req.body;

//     const connection = await Connection.findOne({
//       where: { userId, targetId, status: "pending" },
//     });

//     if (!connection) {
//       return res.status(404).json({ error: "Không tìm thấy lời mời kết bạn" });
//     }

//     await connection.destroy();

//     res.status(200).json({ message: "Đã hủy lời mời kết bạn" });
//   } catch (error) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return res.status(500).send(resHelper.error(500, "Internal Server Error", message));
//   }
// };

// const unfriend = async (req: Request, res: Response) => {
//   try {
//     const { userId, targetId } = req.body;

//     const connection = await Connection.findOne({
//       where: {
//         [Op.or]: [
//           { userId, targetId, status: "accepted" },
//           { targetId, userId, status: "accepted" },
//         ],
//       },
//     });

//     if (!connection) {
//       return res.status(404).json({ error: "Không tìm thấy kết nối" });
//     }

//     await connection.destroy();

//     res.status(200).json({ message: "Đã hủy kết bạn" });
//   } catch (error) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return res.status(500).send(resHelper.error(500, "Internal Server Error", message));
//   }
// };

// const blockUser = async (req: Request, res: Response) => {
//   try {
//     const { userId, targetId } = req.body;

//     const existingBlock = await Connection.findOne({
//       where: { userId, targetId, status: "blocked" },
//     });

//     if (existingBlock) {
//       return res.status(400).json({ error: "Đã chặn người này rồi" });
//     }

//     await Connection.upsert({
//       userId,
//       targetId,
//       status: "blocked",
//     });

//     res.status(200).json({ message: "Đã chặn người dùng" });
//   } catch (error) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return res.status(500).send(resHelper.error(500, "Internal Server Error", message));
//   }
// };

// const unblockUser = async (req: Request, res: Response) => {
//   try {
//     const { userId, targetId } = req.body;

//     const connection = await Connection.findOne({
//       where: { userId, targetId, status: "blocked" },
//     });

//     if (!connection) {
//       return res.status(404).json({ error: "Không tìm thấy kết nối đã chặn" });
//     }

//     await connection.destroy();

//     res.status(200).json({ message: "Đã bỏ chặn người dùng" });
//   } catch (error) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return res.status(500).send(resHelper.error(500, "Internal Server Error", message));
//   }
// };

// const getFriends = async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.params;

//     const friends = await Connection.findAll({
//       where: {
//         [Op.or]: [
//           { userId, status: "accepted" },
//           { userId, status: "accepted" },
//         ],
//       },
//       include: [{ model: User, as: "friendInfo" }],
//     });

//     res.status(200).json(friends);
//   } catch (error) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return res.status(500).send(resHelper.error(500, "Internal Server Error", message));
//   }
// };

// const suggestFriends = async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.params;
//     const suggestedUsers = await User.findAll({
//       where: { id: { [Op.notIn]: Sequelize.literal(`(SELECT target_id FROM connections WHERE user_id = ${userId})`) } },
//     });
//     res.status(200).json(suggestedUsers);
//   } catch (error) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return res.status(500).send(resHelper.error(500, "Internal Server Error", message));
//   }
// };

// export default {
//   sendFriendRequest,
//   acceptFriendRequest,
//   cancelFriendRequest,
//   unfriend,
//   blockUser,
//   unblockUser,
//   getFriends,
//   suggestFriends,
// };
