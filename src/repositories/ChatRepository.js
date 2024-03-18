const chatModel=require("../models/ChatModel")
const userModel=require("../models/UserModel")
const messageModel=require("../models/MessageModel")
class ChatRepository{
    async getChatWithUser(req, res) {
        const id = req.user._id;
        try {
            const chatWithUser = await chatModel.find({ users: { $in: [id] } }).sort({ createdAt: -1 });
    
            const otherUserIds = chatWithUser.flatMap(chat => chat.users).filter(userId => userId != id);
            const otherUsers = await userModel.find({ _id: { $in: otherUserIds } }).select("full_name image");
            const contentMessage = await Promise.all(
                chatWithUser.map(async (chat) => {
                    const messages = await messageModel.findOne({ chatId: chat._id }).select("chatId message").sort({ createdAt: -1 }).limit(1);
                    return messages
                })
            );
    
            // Kết hợp otherUsers và contentMessage vào một mảng mới
            const combinedData = otherUsers.map((user, index) => ({
                user: user,
                content: contentMessage[index]
            }));
    
            return res.status(201).json(combinedData);
        } catch (error) {
            return res.status(501).json(error);
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