const NotificationModel=require("../models/NotificationModel")
class NotificationRepository{
    async getNotification(req,res){
        try {
            const userId=req.user._id
            const notificationRepairman=await NotificationModel.find({repairman_id:userId,status:"active"})
            .select("-_id -titleRepairmanFinder -bodyRepairmanFinder")
            .sort({createdAt:-1})
            .populate({
                path: "service_id",
                select: "image"
              });
            if (notificationRepairman.length===0) {
                const notificationRepairmanFinder = await NotificationModel.find({user_id:userId,status:"active"})
                .select("-_id -titleRepairman -bodyRepairman")
                .sort({createdAt:-1})
                .populate({
                    path: "service_id",
                    select: "image"
                });
                return res.status(200).json({status:200,message:"Lấy thông báo thành công",data:notificationRepairmanFinder})
            }
            return res.status(200).json({status:200,message:"Lấy thông báo thành công",data:notificationRepairman}) 
        } catch (error) {
            return res.status(500).json({status:500,message:error.message})
        }
    }
}
module.exports=new NotificationRepository()