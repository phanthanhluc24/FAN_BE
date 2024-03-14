const express=require("express")
const route=express.Router()
const MessageController=require("../controllers/MessageController")
route.post("/chat-with",MessageController.chatWith)
route.get("/get-conversation-with/:id",MessageController.getMessageConversationByChatId)
module.exports=route