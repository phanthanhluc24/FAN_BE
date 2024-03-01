const NotificationRepository=require("../repositories/NotificationRepository")
class NotificationController{
    async getNotification(req,res){
        await NotificationRepository.getNotification(req,res)
    }
}
module.exports=new NotificationController()