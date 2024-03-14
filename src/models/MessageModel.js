const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageModel = new Schema({
  chatId: { type: Schema.Types.ObjectId, ref: "members-chat", require: true },
  senderId: { type: Schema.Types.ObjectId, ref: "users", require: true },
  message: { type: String },
},{
  timestamps:true
});

const Message=mongoose.model("messages",MessageModel)
module.exports=Message