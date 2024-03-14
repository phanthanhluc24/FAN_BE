const express=require("express")
const route=express.Router()
const ChatController=require("../controllers/ChatController")
    route.get("/",ChatController.getChatWithUser)
    route.get("/:senderId/:receivedId",ChatController.compareGetIdRoomChat)
module.exports=route