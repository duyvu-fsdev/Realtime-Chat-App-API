"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Messages", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      conversationId: { allowNull: false, type: Sequelize.INTEGER },
      senderId: { allowNull: false, type: Sequelize.INTEGER },
      replyMessageId: { type: Sequelize.INTEGER },
      status: { allowNull: false, type: Sequelize.STRING },
      type: { allowNull: false, type: Sequelize.STRING, defaultValue: "text" },
      content: { type: Sequelize.TEXT },
      readBy: { type: Sequelize.TEXT, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Messages");
  },
};
