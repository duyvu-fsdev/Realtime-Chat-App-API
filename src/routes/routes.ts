import express from "express";
import { authenticated, checkRole, upload, validation } from "../middleware";
import {
  authController,
  userController,
  conversationController,
  messageController,
  attachmentController,
  relationshipController,
} from "../controllers";
import multer from "multer";
import imgController from "../controllers/mediaController";
const router = express.Router();

//auth routes
router.post("/get-reg-otp", validation.otpRegisterValidation, authController.getOtp);
router.post("/register", validation.registerValidation, authController.register);
router.post("/login", authController.userLogin);
router.get("/profile", authenticated, authController.getProfile);
router.patch("/update-profile", authenticated, authController.updateProfileById);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password", validation.resetPwValidation, authController.resetPassword);
//user routes
router.get("/users", authenticated, checkRole(["admin"]), userController.getUsers);
router.get("/user/:id", authenticated, checkRole(["admin", "user"]), userController.getUserById);
router.post("/user", authenticated, checkRole(["admin"]), userController.createUser);
router.post("/users", authenticated, checkRole(["admin", "user"]), userController.getUserByIds);
router.patch("/update-user", authenticated, checkRole(["admin"]), userController.updateUserByEmail);
router.delete("/user/:id", authenticated, checkRole(["admin"]), userController.deleteUserById);
router.post(
  "/users/import",
  authenticated,
  checkRole(["admin"]),
  upload.importFile.single("file"),
  userController.importUsers
);
router.get("/users-filter", authenticated, checkRole(["admin", "user"]), userController.getUsersByNameOrEmail);
//conversation routes
router.get("/all-conversations", authenticated, checkRole(["admin"]), conversationController.getAllConversations);
router.get(
  "/conversations/:userId",
  authenticated,
  checkRole(["user"]),
  conversationController.getAllConversationsByUserId
);
router.get("/conversation/:id", authenticated, checkRole(["user"]), conversationController.getConversationById);
router.get("/conversation", authenticated, checkRole(["user"]), conversationController.getConversationByMember);
router.post("/conversation", authenticated, checkRole(["user"]), conversationController.createConversation);
router.patch("/update-conversation", authenticated, checkRole(["user"]), conversationController.updateConversation);
router.delete("/conversation/:id", authenticated, checkRole(["user"]), conversationController.deleteConversation);

// message routes
router.get(
  "/messages/:conversationId",
  authenticated,
  checkRole(["user"]),
  messageController.getMessagesByConversationId
);
router.post(
  "/message",
  authenticated,
  checkRole(["user"]),
  upload.sendAttachedFiles.array("files"),
  messageController.createMessage
);
router.patch("/message/:id", authenticated, checkRole(["user"]), messageController.updateMessage);
router.delete("/message/:id", authenticated, checkRole(["user"]), messageController.deleteMessage);

// attachment routes
router.get(
  "/attachment/:cvsId/:msgId/:type/:filename",
  authenticated,
  checkRole(["user"]),
  attachmentController.accessFile
);

// relationship routes
router.post(
  "/relationship/friend-request",
  authenticated,
  checkRole(["user"]),
  relationshipController.sendFriendRequest
);

export default router;
