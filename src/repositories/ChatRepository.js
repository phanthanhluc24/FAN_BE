const chatModel=require("../models/ChatModel")
class ChatRepository{
    async getChatWithUser(req,res){
        const id=req.user._id
        try {
            const chatWithUser=await chatModel.find({users:{$in:[id]}}).sort({createdAt:-1})
            
            // const otherUserId=chatWithUser.flatMap(chat=>chat.users).filter(userId!=userId)
            return res.status(201).json(chatWithUser)
        } catch (error) {
           return res.status(501).json(error)
        }
    }
    
    async compareGetIdRoomChat(req,res){
        const senderId=req.params.senderId
        const receivedId=req.params.receivedId
        try {
            const chatId=await chatModel.findOne({users:{$all:[senderId,receivedId]}})
            return res.status(201).json(chatId)
        } catch (error) {
           return res.status(501).json("Fail to get chat room")
        }
    }
}
module.exports=new ChatRepository()