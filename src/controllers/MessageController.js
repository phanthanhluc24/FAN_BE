const messageRepository=require("../repositories/MessageRepository")
class MessageController{
    async chatWith(req,res){
        await messageRepository.messageWith(req,res)
    }

    async getMessageConversationByChatId(req,res){
        await messageRepository.getMessageConversationByChatId(req,res)
    }
}
module.exports=new MessageController()