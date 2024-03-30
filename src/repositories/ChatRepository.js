const chatModel=require("../models/ChatModel")
const userModel=require("../models/UserModel")
const messageModel=require("../models/MessageModel")
class ChatRepository{
    async getChatWithUser(req, res) {
        const id = req.user._id;
        try {
            const chatWithUser = await chatModel.find({ users: { $in: [id] } }).sort({ updatedAt: -1 });
    
            const otherUserIds = chatWithUser.flatMap(chat => chat.users).filter(userId => userId != id);
            const otherUsers = await userModel.find({ _id: { $in: otherUserIds } }).select("full_name image");
            const contentMessages = await Promise.all(
                chatWithUser.map(async (chat) => {
                    const messages = await messageModel.findOne({ chatId: chat._id }).select("chatId message").sort({ updatedAt: -1 }).limit(1);
                    return messages;
                })
            );
            const combinedData = otherUsers.map((user) => {
                const chat = chatWithUser.find(chat => chat.users.includes(user._id));
                const messages = contentMessages.find(messages => messages.chatId.equals(chat._id));
                return {
                    user: user,
                    content: messages
                };
            });
    
            return res.status(201).json(combinedData);
        } catch (error) {
            console.log(error);
            return res.status(501).json(error);
        }
    }
    
    
    
    async compareGetIdRoomChat(req,res){
        const senderId=req.user._id
        const receivedId=req.params.receivedId
        try {
            const chatId=await chatModel.findOne({users:{$all:[senderId,receivedId]}}).select("_id")
            if (!chatId) {
                return res.status(200).json({status:200,data:null})
            }
            return res.status(200).json(chatId)
        } catch (error) {
           return res.status(501).json("Fail to get chat room")
        }
    }
}
module.exports=new ChatRepository()