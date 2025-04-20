"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Attachments", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      messageId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Messages", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      url: { allowNull: false, type: Sequelize.STRING },
      type: { allowNull: false, type: Sequelize.STRING },
      size: { type: Sequelize.INTEGER },
      originalname: { allowNull: false, type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Attachments");
  },
};
