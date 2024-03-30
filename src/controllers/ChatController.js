const ChatRepository=require("../repositories/ChatRepository")
class ChatController{
    async getChatWithUser(req,res){
        await ChatRepository.getChatWithUser(req,res)
    }

    async compareGetIdRoomChat(req,res){
        await ChatRepository.compareGetIdRoomChat(req,res)
    }
}
module.exports=new ChatController();