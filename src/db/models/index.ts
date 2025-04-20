import User from "./user";
import Conversation from "./conversation";
import Message from "./message";
import Attachment from "./attachment";
import ConversationMember from "./conversationMember";
import Connection from "./connection";

User.belongsToMany(Conversation, { through: ConversationMember, foreignKey: "userId", as: "conversations" });
Conversation.belongsToMany(User, { through: ConversationMember, foreignKey: "conversationId", as: "members" });
Conversation.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Conversation.hasMany(ConversationMember, { foreignKey: "conversationId", as: "conversationMembers" });
ConversationMember.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });
ConversationMember.belongsTo(User, { foreignKey: "userId", as: "user" });

Conversation.hasMany(Message, { foreignKey: "conversationId", as: "messages" });
Message.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });

User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });

Message.hasMany(Attachment, { foreignKey: "messageId", as: "attachments" });
Attachment.belongsTo(Message, { foreignKey: "messageId", as: "message" });

User.hasMany(Connection, { foreignKey: "userId", as: "sentConnections" });
User.hasMany(Connection, { foreignKey: "targetId", as: "receivedConnections" });

Connection.belongsTo(User, { foreignKey: "userId", as: "requester" });
Connection.belongsTo(User, { foreignKey: "targetId", as: "receiver" });

Message.belongsTo(Message, { foreignKey: "replyMessageId", as: "replyMessage" });

export { User, Conversation, Message, Attachment, ConversationMember, Connection };
