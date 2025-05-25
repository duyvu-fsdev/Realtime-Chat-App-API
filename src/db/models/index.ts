import User from "./user";
import Conversation from "./conversation";
import Message from "./message";
import Attachment from "./attachment";
import ConversationMember from "./conversationMember";
import Relationship from "./relationship";

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

User.hasMany(Relationship, { foreignKey: "user1", as: "sentConnections" });
User.hasMany(Relationship, { foreignKey: "user2", as: "receivedConnections" });

Relationship.belongsTo(User, { foreignKey: "user1", as: "requester" });
Relationship.belongsTo(User, { foreignKey: "user2", as: "receiver" });

Message.belongsTo(Message, { foreignKey: "replyMessageId", as: "replyMessage" });

export { User, Conversation, Message, Attachment, ConversationMember, Relationship };
