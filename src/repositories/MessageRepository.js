const messageModel = require("../models/MessageModel");
const chatModel = require("../models/ChatModel");
const mongoose = require('mongoose');
const UserModel=require("../models/UserModel")
const admin = require("firebase-admin")
class MessageRepository {
  async findChat(senderId, receivedId) {
    try {
      const chat = await chatModel.findOne({
        users: { $all: [senderId, receivedId] },
      });
      return chat
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: 500, message: error.message })
    }
  }
  async messageWith(req, res) {
    try {
      const { receivedId, message } = req.body;
      const senderId = req.user._id
      const user=await UserModel.findOne({_id:receivedId}).select("deviceToken")
      const existingChat = await this.findChat(senderId, receivedId);
      const payloadNotification = {
        notification: {
          title: "Tin nhắn mới",
          body: `${message}`,
        }
      }
      if (existingChat) {
        const messages = await messageModel.create({
          chatId: existingChat._id,
          senderId,
          message,
        });
        await admin.messaging().sendToDevice(user.deviceToken,payloadNotification)
        return res.status(200).json({ message: "Add message successfully", messages });
      } else {
        const chat = await chatModel.create({
          users: [senderId, receivedId],
        });
        const messages = await messageModel.create({
          chatId: chat._id,
          senderId,
          message,
        });
        await admin.messaging().sendToDevice(user.deviceToken,payloadNotification)
        return res.status(200).json({ message: "Add message successfully", messages });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: 500, message: error.message })
    }
  }

  async getMessageConversationByChatId(req, res) {
    const { id } = req.params;
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(201).json([]);
      }
      const message = await messageModel
        .find({ chatId: id })
        .populate("chatId")
      return res.status(201).json(message);
    } catch (error) {
      return res.status(500).json(error);
    }
  }
}
module.exports = new MessageRepository();